import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import db, { sequelize } from "@/models/index.js";
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
	getUserProductsService: async (userId: string | number) => {
		return await db.Product.findAll({
			where: { userId, active: true },
			include: [
				{
					model: db.Price,
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

		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			mode: "payment",
			line_items: [
				{
					price: price.stripePriceId,
					quantity,
				},
			],
			success_url: `${process.env.FRONTEND_URL}/products/success`,
			cancel_url: `${process.env.FRONTEND_URL}/products/cancel`,
			metadata: {
				userId: String(user.id),
				priceId: String(price.id),
			},
		});

		if (!session.url) {
			throw new AppError("Failed to generate Stripe checkout URL", 500);
		}

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

			// Archive the Stripe product if DB creation failed so it isn't orphaned
			if (stripeProduct) {
				await stripe.products
					.update(stripeProduct.id, {active: false})
					.catch((err) => console.error("Failed to archive orphaned Stripe product:", err));
			}

			throw error;
		}
	}
}