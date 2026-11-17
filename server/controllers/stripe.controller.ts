import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { stripeService } from "@/services/stripe.service.js";

export const getUserProducts = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const products = await stripeService.getUserProductsService(userId);
	return res.json(products);
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

	return res.json({ url });
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

	return res.status(201).json(result);
};