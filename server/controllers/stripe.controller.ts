import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { stripeService } from "@/services/stripe.service.js";

export const getAllProducts = async (req: Request, res: Response) => {
	const products = await stripeService.getAllProducts();

	return res.status(200).json({	success: true, data: products	});
};

export const getMyProducts = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const products = await stripeService.getUserProducts(userId);
	return res.status(200).json({	success: true, data: products	});
};

export const createCheckoutSession = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid request body", 400);
	}

	const userId = res.locals.user!.id;
	const { priceId, quantity = 1 } = req.body;

	if (!priceId) {
		throw new AppError("priceId is required", 400);
	}

	const parsedQuantity = Number(quantity);
	if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
		throw new AppError("Quantity must be a positive integer", 400);
	}

	const url = await stripeService.createCheckoutSession({
		userId,
		priceId,
		quantity: parsedQuantity,
	});

	return res.status(200).json({	success: true, url });
};

export const createProduct = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid request body", 400);
	}

	const userId = res.locals.user!.id;
	const { name, description, unitAmount, currency = "usd" } = req.body;

	const parsedAmount = Number(unitAmount);
	if (!name || typeof name !== "string" || !Number.isInteger(parsedAmount) || parsedAmount <= 0) {
		throw new AppError("Valid name and positive integer unitAmount (in cents) are required", 400);
	}

	const result = await stripeService.createProduct({
		userId,
		name: name.trim(),
		description,
		unitAmount: parsedAmount,
		currency: String(currency).toLowerCase(),
	});

	return res.status(201).json({success: true, data: result});
};

export const getUserOrders = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const orders = await stripeService.getUserOrders(userId);

	return res.status(200).json({ success: true, data: orders });
};

export const handleWebhook = async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"];

	if (!signature || typeof signature !== "string") {
		throw new AppError("Missing stripe-signature header", 400);
	}

	const rawBody = (req as any).rawBody;
	if (!rawBody) {
		throw new AppError("Missing raw request body", 400);
	}

	await stripeService.handleWebhookEvent(rawBody, signature);

	return res.status(200).json({ received: true });
};