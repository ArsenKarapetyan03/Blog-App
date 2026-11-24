import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import db, { sequelize } from "@/models/index.js";
import type { Order } from "@/models/order.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import type { PriceInterval, PriceType } from "@/models/price.js";
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

interface CreateProductParams {
	userId: number;
	name: string;
	description?: string | undefined;
	unitAmount: number;
	currency: string;
	type?: PriceType | undefined;
	interval?: PriceInterval | null | undefined;
	intervalCount?: number | null | undefined;
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
}

const statusMap = await db.OrderStatus.getStatusMap();

export const stripeService = {
	createProduct: async ({ userId, name, description, unitAmount, currency, type = "one_time", interval = null, intervalCount = null }: CreateProductParams) => {
		const isRecurring = type === "recurring";
		const resolvedIntervalCount = isRecurring ? (intervalCount ?? 1) : null;

		if (isRecurring && !interval) {
			throw new AppError("Recurring products must specify a billing interval", 400);
		}

		if (!isRecurring && (interval != null || intervalCount != null)) {
			throw new AppError("One-time products cannot have an interval or intervalCount", 400);
		}

		if (resolvedIntervalCount != null && (!Number.isInteger(resolvedIntervalCount) || resolvedIntervalCount < 1)) {
			throw new AppError("intervalCount must be a positive integer", 400);
		}

		const transaction = await sequelize.transaction();
		let stripeProduct: Stripe.Product | null = null;

		try {
			stripeProduct = await stripe.products.create({
				name,
				...(description ? { description } : {}),
				metadata: {
					userId: String(userId),
				},
			});

			const stripePrice = await stripe.prices.create({
				product: stripeProduct.id,
				unit_amount: unitAmount,
				currency,
				...(isRecurring && {
					recurring: {
						interval: interval!,
						interval_count: resolvedIntervalCount!,
					},
				}),
			});

			const product = await db.Product.create(
				{
					userId,
					stripeProductId: stripeProduct.id,
					name,
					description: description ?? null,
					active: true,
				},
				{ transaction }
			);

			const price = await db.Price.create(
				{
					productId: product.id,
					stripePriceId: stripePrice.id,
					unitAmount: stripePrice.unit_amount!,
					currency: stripePrice.currency,
					type,
					interval: isRecurring ? interval : null,
					intervalCount: resolvedIntervalCount,
					active: true,
				},
				{ transaction }
			);

			await db.SellerBalance.findOrCreate({
				where: { userId },
				defaults: {
					userId,
					availableAmount: 0,
					pendingAmount: 0,
					currency: stripePrice.currency,
				},
				transaction,
			});

			await transaction.commit();

			return { product, price };
		} catch (error) {
			await transaction.rollback();

			if (stripeProduct) {
				await stripe.products
					.update(stripeProduct.id, {active: false})
					.catch((err) => console.error("Failed to archive orphaned Stripe product:", err));
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

	updateProduct: async (productParams: UpdateProductParams) => {
		const {productId, userId, name, description, unitAmount, currency} = productParams;

		const product = await db.Product.findOne({
			where: {id: productId, userId},
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
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

		const activePrices = product.Prices || [];
		const currentPrice = activePrices[0];

		const targetAmount = unitAmount ?? currentPrice?.unitAmount;
		const targetCurrency = currency ?? currentPrice?.currency ?? "usd";

		const isPriceChanged =
			(unitAmount !== undefined && unitAmount !== currentPrice?.unitAmount) ||
			(currency !== undefined && currency !== currentPrice?.currency);

		const isProductInfoChanged =
			(name !== undefined && name !== product.name) ||
			(description !== undefined && description !== product.description);

		if (!isPriceChanged && !isProductInfoChanged) {
			return {product, price: currentPrice ?? null};
		}

		const transaction = await sequelize.transaction();
		let newStripePrice: Stripe.Price | null = null;

		try {
			if (isProductInfoChanged) {
				await stripe.products.update(product.stripeProductId, {
					...(name !== undefined ? {name} : {}),
					...(description !== undefined ? {description: description ?? ""} : {}),
				});

				await product.update(
					{
						...(name !== undefined ? {name} : {}),
						...(description !== undefined ? {description} : {}),
					},
					{transaction}
				);
			}

			let activePriceRecord = currentPrice ?? null;

			if (isPriceChanged) {
				if (!targetAmount) {
					throw new AppError("unitAmount is required when creating a new price", 400);
				}

				newStripePrice = await stripe.prices.create({
					product: product.stripeProductId,
					unit_amount: targetAmount,
					currency: targetCurrency,
				});

				if (activePrices.length > 0) {
					await Promise.all(
						activePrices.map((p: any) =>
							stripe.prices.update(p.stripePriceId, {active: false})
						)
					);

					await db.Price.update(
						{active: false},
						{where: {productId: product.id, active: true}, transaction}
					);
				}

				activePriceRecord = await db.Price.create(
					{
						productId: product.id,
						stripePriceId: newStripePrice.id,
						unitAmount: newStripePrice.unit_amount!,
						currency: newStripePrice.currency,
						active: true,
					},
					{transaction}
				);
			}

			await transaction.commit();

			return {product, price: activePriceRecord};
		} catch (error) {
			await transaction.rollback();

			if (newStripePrice) {
				await stripe.prices
					.update(newStripePrice.id, {active: false})
					.catch((err) => console.error("Failed to archive orphaned Stripe price:", err));
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

	createCheckoutSession: async ({ userId, items }: CreateCheckoutParams): Promise<string> => {
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
			where: { id: priceIds },
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
				metadata: { userId: String(user.id) },
			});
			stripeCustomerId = customer.id;
			await user.update({ stripeCustomerId });
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
				{ transaction }
			);

			await db.OrderItem.bulkCreate(
				resolvedItems.map(({ price, quantity }) => ({
					orderId: order.id,
					priceId: price.id,
					quantity,
					unitAmount: price.unitAmount,
				})),
				{ transaction }
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
			line_items: resolvedItems.map(({ price, quantity }) => ({
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
			await order.update({ statusId: statusMap.failed });
			throw new AppError("Failed to generate Stripe checkout URL", 500);
		}

		await order.update({ stripeCheckoutSessionId: session.id });

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