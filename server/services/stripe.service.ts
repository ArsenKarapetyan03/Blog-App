import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import db, { sequelize } from "@/models/index.js";
import type { Order } from "@/models/order.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import type { PriceInterval, PriceType, Price } from "@/models/price.js";
import type { Product } from "@/models/product.js";
import {
	fulfillOrderAndCreditSeller,
	handleChargeRefunded,
	handleSubscriptionInvoiceFailed,
	handleSubscriptionInvoicePaid,
	initializeSubscriptionFromCheckout,
	syncSubscriptionFromStripe,
	updatePendingOrderStatus
} from "@/services/Helpers/stripe.helper.js";

interface CheckoutItemInput {
	priceId: string;
	quantity: number;
}

interface CreateCheckoutParams {
	userId: number;
	items: CheckoutItemInput[];
}

interface CancelCheckoutParams {
	userId: number;
	orderId: number;
}

export type RecurringIntervalKey = "day" | "month" | "year";
export type RecurringAmounts = Partial<Record<RecurringIntervalKey, number>>;

const RECURRING_INTERVALS: RecurringIntervalKey[] = ["day", "month", "year"];

interface CreateProductParams {
	userId: number;
	name: string;
	description?: string | undefined;
	unitAmount: number;
	currency: string;
	allowRecurring?: boolean;
	recurringAmounts?: RecurringAmounts | undefined;
}

interface ArchiveProductParams {
	productId: number;
	userId: number;
}

export interface UpdateProductParams {
	productId: number;
	userId: number;
	name?: string;
	description?: string | null;
	unitAmount?: number;
	currency?: string;
	allowRecurring?: boolean;
	recurringAmounts?: RecurringAmounts;
}

const statusMap = await db.OrderStatus.getStatusMap();

export const stripeService = {
	createProduct: async (
		{
			userId,
			name,
			description,
			unitAmount,
			currency,
			allowRecurring = false,
			recurringAmounts,
		}: CreateProductParams
	): Promise<{ product: Product; prices: Price[] }> => {
		const transaction = await sequelize.transaction();
		let stripeProduct: Stripe.Product | null = null;

		try {
			stripeProduct = await stripe.products.create({
				name,
				...(description ? {description} : {}),
				metadata: {
					userId: String(userId),
				},
			});

			const oneTimeStripePrice = await stripe.prices.create({
				product: stripeProduct.id,
				unit_amount: unitAmount,
				currency,
			});

			const recurringStripePrices = allowRecurring
				? await Promise.all(
					RECURRING_INTERVALS.map((interval) =>
						stripe.prices.create({
							product: stripeProduct!.id,
							unit_amount: recurringAmounts?.[interval] ?? unitAmount,
							currency,
							recurring: {
								interval,
								interval_count: 1,
							},
						})
					)
				)
				: [];

			const product = await db.Product.create(
				{
					userId,
					stripeProductId: stripeProduct.id,
					name,
					description: description ?? null,
					active: true,
				},
				{transaction}
			);

			const pricePayloads = [
				{
					productId: product.id,
					stripePriceId: oneTimeStripePrice.id,
					unitAmount: oneTimeStripePrice.unit_amount!,
					currency: oneTimeStripePrice.currency,
					type: "one_time" as PriceType,
					interval: null,
					intervalCount: null,
					active: true,
				},
				...recurringStripePrices.map((sp) => ({
					productId: product.id,
					stripePriceId: sp.id,
					unitAmount: sp.unit_amount!,
					currency: sp.currency,
					type: "recurring" as PriceType,
					interval: sp.recurring!.interval as PriceInterval,
					intervalCount: sp.recurring!.interval_count ?? 1,
					active: true,
				})),
			];

			const prices = await db.Price.bulkCreate(pricePayloads, {transaction});

			await db.SellerBalance.findOrCreate({
				where: {userId},
				defaults: {
					userId,
					availableAmount: 0,
					pendingAmount: 0,
					currency: oneTimeStripePrice.currency,
				},
				transaction,
			});

			await transaction.commit();

			return {product, prices};
		} catch (error) {
			await transaction.rollback();

			if (stripeProduct) {
				await stripe.products
					.update(stripeProduct.id, {active: false})
					.catch((err) =>
						console.error("Failed to archive orphaned Stripe product:", err)
					);
			}

			throw error;
		}
	},

	archiveProduct: async ({productId, userId}: ArchiveProductParams) => {
		const product = await db.Product.findOne({
			where: {id: productId, userId},
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
					required: false
				}
			],
		});

		if (!product) {
			throw new AppError("Product not found", 404);
		}

		if (!product.active) {
			throw new AppError("Product is already archived", 400);
		}

		const transaction = await sequelize.transaction();
		const activePrices = product.Prices || [];

		try {
			await Promise.all(
				activePrices.map((price: any) =>
					stripe.prices.update(price.stripePriceId, {active: false})
				)
			);

			await stripe.products.update(product.stripeProductId, {active: false});

			await db.Price.update(
				{active: false},
				{where: {productId: product.id, active: true}, transaction}
			);

			await product.update({active: false}, {transaction});

			await transaction.commit();

			return product;
		} catch (error) {
			await transaction.rollback();

			await stripe.products
				.update(product.stripeProductId, {active: true})
				.catch((err) => console.error("Failed to rollback Stripe product archive:", err));

			throw error;
		}
	},

	updateProduct: async (productParams: UpdateProductParams): Promise<{ product: Product; prices: Price[] }> => {
		const {
			productId,
			userId,
			name,
			description,
			unitAmount,
			currency,
			allowRecurring,
			recurringAmounts,
		} = productParams;

		const product = await db.Product.findOne({
			where: { id: productId, userId },
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
				},
			],
		});

		if (!product) {
			throw new AppError("Product not found", 404);
		}

		if (!product.active) {
			throw new AppError("Cannot update an archived product", 400);
		}

		const activePrices: Price[] = product.Prices || [];
		const currentOneTime =
			activePrices.find((p) => p.type === "one_time") ?? activePrices[0];
		const currentRecurring = activePrices.filter((p) => p.type === "recurring");

		const currentlyAllowsRecurring = currentRecurring.length > 0;
		const targetAllowRecurring = allowRecurring ?? currentlyAllowsRecurring;

		const targetOneTimeAmount = unitAmount ?? currentOneTime?.unitAmount;
		const targetCurrency = currency ?? currentOneTime?.currency ?? "usd";

		if (!targetOneTimeAmount) {
			throw new AppError(
				"unitAmount is required when updating product pricing",
				400
			);
		}

		const isProductInfoChanged =
			(name !== undefined && name !== product.name) ||
			(description !== undefined && description !== product.description);

		const isOneTimeChanged =
			!currentOneTime ||
			targetOneTimeAmount !== currentOneTime.unitAmount ||
			targetCurrency !== currentOneTime.currency;

		const desiredRecurringByInterval = new Map<
			RecurringIntervalKey,
			{ amount: number; currency: string; existing?: Price }
		>();

		if (targetAllowRecurring) {
			for (const interval of RECURRING_INTERVALS) {
				const existing = currentRecurring.find((p) => p.interval === interval);
				const desiredAmount =
					recurringAmounts?.[interval] ??
					existing?.unitAmount ??
					targetOneTimeAmount;

				desiredRecurringByInterval.set(interval, {
					amount: desiredAmount,
					currency: targetCurrency,
					...(existing ? { existing } : {}),
				});
			}
		}

		const hasRecurringChanges =
			targetAllowRecurring !== currentlyAllowsRecurring ||
			RECURRING_INTERVALS.some((interval) => {
				const desired = desiredRecurringByInterval.get(interval);
				const existing = currentRecurring.find((p) => p.interval === interval);
				if (!desired && !existing) return false;
				if (!desired || !existing) return true;
				return (
					desired.amount !== existing.unitAmount ||
					desired.currency !== existing.currency
				);
			});

		if (!isProductInfoChanged && !isOneTimeChanged && !hasRecurringChanges) {
			return { product, prices: activePrices };
		}

		const transaction = await sequelize.transaction();
		const createdStripePrices: Stripe.Price[] = [];

		try {
			if (isProductInfoChanged) {
				await stripe.products.update(product.stripeProductId, {
					...(name !== undefined ? { name } : {}),
					...(description !== undefined ? { description: description ?? "" } : {}),
				});

				await product.update(
					{
						...(name !== undefined ? { name } : {}),
						...(description !== undefined ? { description } : {}),
					},
					{ transaction }
				);
			}

			const pricesToArchive: Price[] = [];
			const newPricePayloads: any[] = [];
			const keptPrices: Price[] = [];

			if (isOneTimeChanged) {
				if (currentOneTime) {
					pricesToArchive.push(currentOneTime);
				}

				const newOneTimeStripe = await stripe.prices.create({
					product: product.stripeProductId,
					unit_amount: targetOneTimeAmount,
					currency: targetCurrency,
				});
				createdStripePrices.push(newOneTimeStripe);

				newPricePayloads.push({
					productId: product.id,
					stripePriceId: newOneTimeStripe.id,
					unitAmount: newOneTimeStripe.unit_amount!,
					currency: newOneTimeStripe.currency,
					type: "one_time" as PriceType,
					interval: null,
					intervalCount: null,
					active: true,
				});
			} else if (currentOneTime) {
				keptPrices.push(currentOneTime);
			}

			if (!targetAllowRecurring) {
				pricesToArchive.push(...currentRecurring);
			} else {
				for (const interval of RECURRING_INTERVALS) {
					const desired = desiredRecurringByInterval.get(interval)!;
					const existing = desired.existing;

					if (
						existing &&
						existing.unitAmount === desired.amount &&
						existing.currency === desired.currency
					) {
						keptPrices.push(existing);
					} else {
						if (existing) {
							pricesToArchive.push(existing);
						}

						const newRecurringStripe = await stripe.prices.create({
							product: product.stripeProductId,
							unit_amount: desired.amount,
							currency: desired.currency,
							recurring: { interval, interval_count: 1 },
						});
						createdStripePrices.push(newRecurringStripe);

						newPricePayloads.push({
							productId: product.id,
							stripePriceId: newRecurringStripe.id,
							unitAmount: newRecurringStripe.unit_amount!,
							currency: newRecurringStripe.currency,
							type: "recurring" as PriceType,
							interval,
							intervalCount: 1,
							active: true,
						});
					}
				}
			}

			if (pricesToArchive.length > 0) {
				await Promise.all(
					pricesToArchive.map((p) =>
						stripe.prices.update(p.stripePriceId, { active: false })
					)
				);

				await db.Price.update(
					{ active: false },
					{
						where: { id: pricesToArchive.map((p) => p.id) },
						transaction,
					}
				);
			}

			const createdPriceRecords =
				newPricePayloads.length > 0
					? await db.Price.bulkCreate(newPricePayloads, { transaction })
					: [];

			await transaction.commit();

			const finalPrices: Price[] = [...keptPrices, ...createdPriceRecords];
			return { product, prices: finalPrices };
		} catch (error) {
			await transaction.rollback();

			if (createdStripePrices.length > 0) {
				await Promise.all(
					createdStripePrices.map((sp) =>
						stripe.prices
							.update(sp.id, { active: false })
							.catch((err) =>
								console.error("Failed to archive orphaned Stripe price:", err)
							)
					)
				);
			}

			throw error;
		}
	},

	refundPayment: async (paymentIntentId: string) => {
		if (!paymentIntentId) {
			throw new AppError("Payment intent ID is required for refund", 400);
		}

		try {
			const refund = await stripe.refunds.create({
				payment_intent: paymentIntentId,
			});

			return {
				refundId: refund.id,
				status: refund.status,
				amount: refund.amount,
			};
		} catch (error: any) {
			throw new AppError(
				error.message || "Failed to process Stripe refund",
				error.statusCode || 400
			);
		}
	},

	createCheckoutSession: async ({userId, items}: CreateCheckoutParams): Promise<string> => {
		const user = await db.User.findByPk(userId);
		if (!user) {
			throw new AppError("User not found", 404);
		}

		if (!items || items.length === 0) {
			throw new AppError("Checkout must contain at least one item", 400);
		}

		const mergedQuantities = new Map<string, number>();
		for (const item of items) {
			const key = String(item.priceId);
			const currentQty = mergedQuantities.get(key) ?? 0;
			mergedQuantities.set(key, currentQty + item.quantity);
		}

		const priceIds = Array.from(mergedQuantities.keys());
		const prices = await db.Price.findAll({
			where: {id: priceIds},
			include: [
				{
					model: db.Product,
					as: "Product",
					attributes: ["id", "userId", "active"],
				},
			],
		});

		const firstPrice = prices[0];
		if (!firstPrice || prices.length !== priceIds.length) {
			throw new AppError("One or more prices were not found", 404);
		}

		const hasRecurring = prices.some((p) => p.type === "recurring");
		const hasOneTime = prices.some((p) => p.type === "one_time");

		if (hasRecurring && hasOneTime) {
			throw new AppError("Cannot mix one-time and subscription items in the same checkout", 400);
		}

		if (hasRecurring) {
			if (prices.length > 1 || mergedQuantities.get(String(firstPrice.id)) !== 1) {
				throw new AppError(
					"Only one subscription plan (quantity 1) can be purchased at a time",
					400
				);
			}

			const existingSub = await db.Subscription.findOne({
				where: {
					userId: user.id,
					priceId: firstPrice.id,
					status: ["active", "trialing", "past_due"],
				},
			});

			if (existingSub) {
				throw new AppError("You already have an active subscription for this plan", 400);
			}
		}

		const baseCurrency = firstPrice.currency.toLowerCase();
		let totalAmount = 0;

		const resolvedItems = prices.map((price) => {
			if (!price.active || !price.Product?.active) {
				throw new AppError(`Product or price ${price.id} is no longer active`, 400);
			}

			if (price.Product.userId === user.id) {
				throw new AppError("You cannot purchase your own product", 400);
			}

			if (price.currency.toLowerCase() !== baseCurrency) {
				throw new AppError("All items in a checkout session must use the same currency", 400);
			}

			const quantity = mergedQuantities.get(String(price.id))!;
			if (!Number.isInteger(quantity) || quantity <= 0) {
				throw new AppError("Quantity must be a positive integer", 400);
			}

			totalAmount += price.unitAmount * quantity;

			return {
				price,
				quantity,
			};
		});

		let stripeCustomerId = user.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				name: user.name,
				metadata: {userId: String(user.id)},
			});
			stripeCustomerId = customer.id;
			await user.update({stripeCustomerId});
		}

		const transaction = await sequelize.transaction();
		let order: Order;

		try {
			order = await db.Order.create(
				{
					userId: user.id,
					statusId: statusMap.pending,
					totalAmount,
					currency: baseCurrency,
				},
				{transaction}
			);

			await db.OrderItem.bulkCreate(
				resolvedItems.map(({price, quantity}) => ({
					orderId: order.id,
					priceId: price.id,
					quantity,
					unitAmount: price.unitAmount,
				})),
				{transaction}
			);

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}

		const sharedMetadata = {
			userId: String(user.id),
			orderId: String(order.id),
		};

		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			mode: hasRecurring ? "subscription" : "payment",
			line_items: resolvedItems.map(({price, quantity}) => ({
				price: price.stripePriceId,
				quantity,
			})),
			client_reference_id: String(order.id),
			metadata: sharedMetadata,
			...(hasRecurring && {
				subscription_data: {
					metadata: sharedMetadata,
				},
			}),
			success_url: hasRecurring
				? `${process.env.FRONTEND_URL}/subscriptions?orderId=${order.id}`
				: `${process.env.FRONTEND_URL}/orders?orderId=${order.id}`,
			cancel_url: `${process.env.FRONTEND_URL}/products?cancel=true&orderId=${order.id}`,
		});

		if (!session.url) {
			await order.update({statusId: statusMap.failed});
			throw new AppError("Failed to generate Stripe checkout URL", 500);
		}

		await order.update({stripeCheckoutSessionId: session.id});

		return session.url;
	},

	cancelCheckoutSession: async ({userId, orderId}: CancelCheckoutParams): Promise<void> => {
		const order = await db.Order.findOne({
			where: {
				id: orderId,
				userId,
			},
		});

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		const pendingStatusId = await db.OrderStatus.getIdByCode("pending");
		if (order.statusId !== pendingStatusId) {
			throw new AppError("Only pending orders can be cancelled", 400);
		}

		if (order.stripeCheckoutSessionId) {
			try {
				const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);

				if (session.status === "open") {
					await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
				}
			} catch (error) {
				console.error(`Failed to expire Stripe session ${order.stripeCheckoutSessionId}:`, error);
			}
		}

		const cancelledStatusId = await db.OrderStatus.getIdByCode("cancelled");
		await order.update({statusId: cancelledStatusId});
	},

	handleWebhookEvent: async (rawBody: Buffer, signature: string) => {
		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(
				rawBody,
				signature,
				process.env.STRIPE_WEBHOOK_SECRET!
			);
		} catch (err: any) {
			throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
		}

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				if (session.payment_status === "paid") {
					await fulfillOrderAndCreditSeller(session);
				}
				if (session.mode === "subscription") {
					await initializeSubscriptionFromCheckout(session);
				}
				break;
			}

			case "checkout.session.async_payment_succeeded": {
				const session = event.data.object as Stripe.Checkout.Session;
				await fulfillOrderAndCreditSeller(session);
				if (session.mode === "subscription") {
					await initializeSubscriptionFromCheckout(session);
				}
				break;
			}

			case "checkout.session.async_payment_failed": {
				const session = event.data.object as Stripe.Checkout.Session;
				await updatePendingOrderStatus(session, statusMap.failed);
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				await updatePendingOrderStatus(session, statusMap.expired);
				break;
			}

			case "invoice.paid": {
				await handleSubscriptionInvoicePaid(event.data.object as Stripe.Invoice);
				break;
			}

			case "invoice.payment_failed": {
				await handleSubscriptionInvoiceFailed(event.data.object as Stripe.Invoice);
				break;
			}

			case "customer.subscription.updated":
			case "customer.subscription.deleted": {
				await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription);
				break;
			}

			case "charge.refunded": {
				await handleChargeRefunded(event.data.object as Stripe.Charge);
				break;
			}
		}
	},
};