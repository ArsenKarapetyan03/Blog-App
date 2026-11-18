import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import db, { sequelize } from "@/models/index.js";
import type { Order } from "@/models/order.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

interface CreateCheckoutParams {
	userId: number;
	priceId: number;
	quantity: number;
}

interface CreateProductParams {
	userId: number;
	name: string;
	description?: string;
	unitAmount: number;
	currency: string;
}

export const stripeService = {
	getAllProducts: async () => {
		return await db.Product.findAll({
			where: {
				active: true,
			},
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},

	getUserProducts: async (userId: string | number) => {
		return await db.Product.findAll({
			where: { userId, active: true },
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: { active: true },
					required: false,
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},

	createCheckoutSession: async ({userId, priceId, quantity}: CreateCheckoutParams): Promise<string> => {
		const user = await db.User.findByPk(userId);
		const price = await db.Price.findByPk(priceId);

		if (!user || !price) {
			throw new AppError("User or Price not found", 404);
		}

		if (!price.active) {
			throw new AppError("This price is no longer active", 400);
		}

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
					status: "pending",
					totalAmount: price.unitAmount * quantity,
					currency: price.currency.toLowerCase(),
				},
				{ transaction }
			);

			await db.OrderItem.create(
				{
					orderId: order.id,
					priceId: price.id,
					quantity,
					unitAmount: price.unitAmount,
				},
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
			line_items: [
				{
					price: price.stripePriceId,
					quantity,
				},
			],
			client_reference_id: String(order.id),
			metadata: {
				userId: String(user.id),
				orderId: String(order.id),
			},
			success_url: `${process.env.FRONTEND_URL}/orders?orderId=${order.id}`,
			cancel_url: `${process.env.FRONTEND_URL}/products?cancel=true&orderId=${order.id}`,
		});

		if (!session.url) {
			await order.update({ status: "failed" });
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
							status: "paid",
							stripeCheckoutSessionId: session.id,
							stripePaymentIntentId: paymentIntentId,
						},
						{
							where: { id: orderId, status: "pending" },
						}
					);
				}
				break;
			}

			case "checkout.session.async_payment_succeeded": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) break;

				const paymentIntentId =
					typeof session.payment_intent === "string"
						? session.payment_intent
						: session.payment_intent?.id ?? null;

				await db.Order.update(
					{
						status: "paid",
						stripePaymentIntentId: paymentIntentId,
					},
					{ where: { id: orderId, status: "pending" } }
				);
				break;
			}

			case "checkout.session.async_payment_failed":
			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = Number(session.metadata?.orderId);
				if (!orderId) break;

				await db.Order.update(
					{ status: "failed" },
					{ where: { id: orderId, status: "pending" } }
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
						{ status: "refunded" },
						{ where: { stripePaymentIntentId: paymentIntentId, status: "paid" } }
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