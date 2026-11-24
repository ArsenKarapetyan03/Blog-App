import db from "@/models/index.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { stripe } from "@/lib/stripe.js";

export const subscriptionService = {
	getUserSubscriptions: async (userId: number) => {
		return await db.Subscription.findAll({
			where: { userId },
			attributes: { exclude: ["stripeSubscriptionId", "updatedAt"] },
			include: [
				{
					model: db.Price,
					as: "Price",
					include: [{ model: db.Product, as: "Product" }]
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},

	cancelSubscription: async (userId: number, subscriptionId: number) => {
		const subscription = await db.Subscription.findOne({
			where: {
				id: subscriptionId,
				userId,
			},
		});

		if (!subscription) {
			throw new AppError("Subscription not found", 404);
		}

		if (subscription.status === "canceled" || subscription.cancelAtPeriodEnd) {
			throw new AppError("Subscription is already canceled or scheduled for cancellation", 400);
		}

		await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
			cancel_at_period_end: true,
		});

		subscription.cancelAtPeriodEnd = true;
		subscription.canceledAt = new Date();
		await subscription.save();

		return subscription;
	}
}