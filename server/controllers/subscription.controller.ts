import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { subscriptionService } from "@/services/subscription.service.js";

export const getSubscriptions = async (req: Request, res: Response) => {
	const subscriptions = await subscriptionService.getSubscriptions();

	return res.status(200).json({ success: true, data: subscriptions });
};

export const getMySubscriptions = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const subscriptions = await subscriptionService.getMySubscriptions(userId);

	return res.status(200).json({ success: true, data: subscriptions });
};

export const cancelAtPeriodEndSubscription = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const subscriptionId = Number(req.params.id);

	if (isNaN(subscriptionId)) {
		throw new AppError("Invalid subscription ID", 400);
	}

	const subscription = await subscriptionService.cancelAtPeriodEndSubscription(
		userId,
		subscriptionId
	);

	return res.status(200).json({ success: true, data: subscription });
};

export const cancelSubscriptionNow = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const subscriptionId = Number(req.params.id);

	if (isNaN(subscriptionId)) {
		throw new AppError("Invalid subscription ID", 400);
	}

	const subscription = await subscriptionService.cancelSubscriptionNow(
		userId,
		subscriptionId
	);

	return res.status(200).json({ success: true, data: subscription });
};
