import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { stripeService, type UpdateProductParams } from "@/services/stripe.service.js";

interface CheckoutItem {
	priceId: string | number;
	quantity?: number;
}

export const getAllProducts = async (req: Request, res: Response) => {
	const products = await stripeService.getAllProducts();

	return res.status(200).json({	success: true, data: products	});
};

export const getProductById = async (req: Request, res: Response) => {
	const productId = Number(req.params.id);

	if (isNaN(productId)) {
		throw new AppError("Invalid product ID", 400);
	}

	const product = await stripeService.getProductById(productId);

	return res.status(200).json({ success: true, data: product });
};

export const getMyProducts = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const products = await stripeService.getUserProducts(userId);
	return res.status(200).json({	success: true, data: products	});
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

	return res.status(201).json({ success: true, data: result });
};

export const archiveProduct = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const productId = Number(req.params.id);

	if (isNaN(productId)) {
		throw new AppError("Invalid product ID", 400);
	}

	const product = await stripeService.archiveProduct({
		productId,
		userId,
	});

	res.status(200).json({ success: true, message: "Product archived successfully" });
}

export const updateProduct = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid request body", 400);
	}

	const userId = res.locals.user!.id;
	const productId = Number(req.params.id);

	if (isNaN(productId)) {
		throw new AppError("Invalid product ID", 400);
	}

	const { name, description, unitAmount, currency } = req.body;
	const updateData: UpdateProductParams = { productId, userId };

	if (name !== undefined) {
		if (typeof name !== "string" || name.trim() === "") {
			throw new AppError("Product name must be a non-empty string", 400);
		}
		updateData.name = name.trim();
	}

	if (description !== undefined) {
		if (description !== null && typeof description !== "string") {
			throw new AppError("Description must be a string or null", 400);
		}
		updateData.description = description;
	}

	if (unitAmount !== undefined) {
		const parsedAmount = Number(unitAmount);
		if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
			throw new AppError("unitAmount must be a positive integer (in cents)", 400);
		}
		updateData.unitAmount = parsedAmount;
	}

	if (currency !== undefined) {
		if (typeof currency !== "string" || currency.trim() === "") {
			throw new AppError("Currency must be a valid string", 400);
		}
		updateData.currency = currency.trim().toLowerCase();
	}

	const result = await stripeService.updateProduct(updateData);

	return res.status(200).json({ success: true, data: result });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid request body", 400);
	}

	const userId = res.locals.user!.id;
	const { items } = req.body as { items?: CheckoutItem[] };

	if (!Array.isArray(items) || items.length === 0) {
		throw new AppError("items must be a non-empty array", 400);
	}

	const validatedItems = items.map((item, index) => {
		if (!item || (typeof item.priceId !== "string" && typeof item.priceId !== "number") || String(item.priceId).trim() === "") {
			throw new AppError(`Valid priceId is required for item at index ${index}`, 400);
		}

		const parsedQuantity = Number(item.quantity ?? 1);
		if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
			throw new AppError(`Quantity must be a positive integer for item at index ${index}`, 400);
		}

		return {
			priceId: String(item.priceId).trim(),
			quantity: parsedQuantity,
		};
	});

	const url = await stripeService.createCheckoutSession({
		userId,
		items: validatedItems,
	});

	return res.status(200).json({ success: true, url });
};

export const cancelCheckoutSession = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const orderId = Number(req.body?.orderId);

	if (!req.body) {
		throw new AppError("Invalid request body", 400);
	}

	if (isNaN(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	await stripeService.cancelCheckoutSession({
		userId,
		orderId,
	});

	return res.status(200).json({
		success: true,
		message: "Checkout session cancelled successfully",
	});
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