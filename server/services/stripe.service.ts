import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import db, { sequelize } from "@/models/index.js";
import type { Order } from "@/models/order.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import type { OrderStatusCode } from "@/models/orderstatus.js";

interface CheckoutItemInput {
	priceId: string;
	quantity: number;
}

interface CreateCheckoutParams {
	userId: number;
	items: CheckoutItemInput[];
}

interface CreateProductParams {
	userId: number;
	name: string;
	description?: string;
	unitAmount: number;
	currency: string;
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

export const stripeService = {
	getAllProducts: async () => {
		return await db.Product.findAll({
			where: { active: true },
			attributes: ["id", "name", "description"],
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
					attributes: ["id", "unitAmount", "currency"],
				},
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name", "email"],
				}
			],
			order: [["createdAt", "DESC"]],
		});
	},

	getProductById: async (productId: number) => {
		const product = await db.Product.findOne({
			where: { id: productId },
			attributes: { exclude: ["stripeProductId"] },
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
					attributes: { exclude: ["stripePriceId"] },
				},
			],
		});

		if (!product) {
			throw new AppError("Product not found", 404);
		}

		return product;
	},

	getUserProducts: async (userId: string | number) => {
		return await db.Product.findAll({
			where: { userId, active: true },
			attributes: ["id", "name", "description"],
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
					attributes: ["id", "unitAmount", "currency"],
				},
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name", "email"],
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},

	createCheckoutSession: async ({ userId, items }: CreateCheckoutParams): Promise<string> => {
		const user = await db.User.findByPk(userId);
		if (!user) {
			throw new AppError("User not found", 404);
		}

		const mergedQuantities = new Map<string, number>();
		for (const item of items) {
			const currentQty = mergedQuantities.get(item.priceId) ?? 0;
			mergedQuantities.set(item.priceId, currentQty + item.quantity);
		}

		const priceIds = Array.from(mergedQuantities.keys());
		const prices = await db.Price.findAll({
			where: { id: priceIds },
		});

		const firstPrice = prices[0];
		if (!firstPrice || prices.length !== priceIds.length) {
			throw new AppError("One or more prices were not found", 404);
		}

		const baseCurrency = firstPrice.currency.toLowerCase();
		let totalAmount = 0;

		const resolvedItems = prices.map((price) => {
			if (!price.active) {
				throw new AppError(`Price ${price.id} is no longer active`, 400);
			}

			if (price.currency.toLowerCase() !== baseCurrency) {
				throw new AppError("All items in a checkout session must use the same currency", 400);
			}

			const quantity = mergedQuantities.get(String(price.id))!;
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
			const pendingStatusId = await db.OrderStatus.getIdByCode("pending");

			order = await db.Order.create(
				{
					userId: user.id,
					statusId: pendingStatusId,
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

		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			mode: "payment",
			line_items: resolvedItems.map(({ price, quantity }) => ({
				price: price.stripePriceId,
				quantity,
			})),
			client_reference_id: String(order.id),
			metadata: {
				userId: String(user.id),
				orderId: String(order.id),
			},
			success_url: `${process.env.FRONTEND_URL}/orders?orderId=${order.id}`,
			cancel_url: `${process.env.FRONTEND_URL}/products?cancel=true&orderId=${order.id}`,
		});

		if (!session.url) {
			const failedStatusId = await db.OrderStatus.getIdByCode("failed");

			await order.update({ statusId: failedStatusId });
			throw new AppError("Failed to generate Stripe checkout URL", 500);
		}

		await order.update({ stripeCheckoutSessionId: session.id });

		return session.url;
	},

	createProduct: async ({userId, name, description, unitAmount, currency}: CreateProductParams) => {
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
			});

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

			const price = await db.Price.create(
				{
					productId: product.id,
					stripePriceId: stripePrice.id,
					unitAmount: stripePrice.unit_amount!,
					currency: stripePrice.currency,
					active: true,
				},
				{transaction}
			);

			await transaction.commit();

			return {product, price};
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

	archiveProduct: async ({ productId, userId }: ArchiveProductParams) => {
		const product = await db.Product.findOne({
			where: { id: productId, userId },
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false }
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
					stripe.prices.update(price.stripePriceId, { active: false })
				)
			);

			await stripe.products.update(product.stripeProductId, { active: false });

			await db.Price.update(
				{ active: false },
				{ where: { productId: product.id, active: true }, transaction }
			);

			await product.update({ active: false }, { transaction });

			await transaction.commit();

			return product;
		} catch (error) {
			await transaction.rollback();

			await stripe.products
				.update(product.stripeProductId, { active: true })
				.catch((err) => console.error("Failed to rollback Stripe product archive:", err));

			throw error;
		}
	},

	updateProduct: async (productParams: UpdateProductParams) => {
		const {	productId,	userId,	name,	description, unitAmount, currency } = productParams;

		const product = await db.Product.findOne({
			where: {id: productId, userId},
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
			return { product, price: currentPrice ?? null };
		}

		const transaction = await sequelize.transaction();
		let newStripePrice: Stripe.Price | null = null;

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
							stripe.prices.update(p.stripePriceId, { active: false })
						)
					);

					await db.Price.update(
						{ active: false },
						{ where: { productId: product.id, active: true }, transaction }
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
					{ transaction }
				);
			}

			await transaction.commit();

			return { product, price: activePriceRecord };
		} catch (error) {
			await transaction.rollback();

			if (newStripePrice) {
				await stripe.prices
					.update(newStripePrice.id, { active: false })
					.catch((err) => console.error("Failed to archive orphaned Stripe price:", err));
			}

			throw error;
		}
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

		const statusMap = await db.OrderStatus.getStatusMap();

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) {
					break;
				}

				if (session.payment_status === "paid") {
					const paymentIntentId =
						typeof session.payment_intent === "string"
							? session.payment_intent
							: session.payment_intent?.id ?? null;

					await db.Order.update(
						{
							statusId: statusMap.paid,
							stripeCheckoutSessionId: session.id,
							stripePaymentIntentId: paymentIntentId,
						},
						{
							where: { id: orderId, statusId: statusMap.pending },
						}
					);
				}
				break;
			}

			case "checkout.session.async_payment_succeeded": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) {
					break;
				}

				const paymentIntentId =
					typeof session.payment_intent === "string"
						? session.payment_intent
						: session.payment_intent?.id ?? null;

				await db.Order.update(
					{
						statusId: statusMap.paid,
						stripePaymentIntentId: paymentIntentId,
					},
					{ where: { id: orderId, statusId: statusMap.pending } }
				);
				break;
			}

			case "checkout.session.async_payment_failed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) break;

				await db.Order.update(
					{ statusId: statusMap.failed },
					{ where: { id: orderId, statusId: statusMap.pending } }
				);
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) break;

				await db.Order.update(
					{ statusId: statusMap.expired },
					{ where: { id: orderId, statusId: statusMap.pending } }
				);
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge;
				const paymentIntentId =
					typeof charge.payment_intent === "string"
						? charge.payment_intent
						: charge.payment_intent?.id;

				if (paymentIntentId) {
					await db.Order.update(
						{ statusId: statusMap.refunded },
						{ where: { stripePaymentIntentId: paymentIntentId, statusId: statusMap.paid } }
					);
				}
				break;
			}
		}
	},

	getUserOrders: async (userId: number) => {
		return await db.Order.findAll({
			where: { userId },
			include: [
				{
					model: db.OrderItem,
					as: "OrderItems",
					include: [
						{
							model: db.Price,
							as: "Price",
							include: [
								{
									model: db.Product,
									as: "Product",
								},
							],
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},
}