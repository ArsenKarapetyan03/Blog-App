import type { Request, Response } from "express";
import { orderService } from "@/services/order.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";

export const getUserOrders = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const { limit, offset } = getPaginationDirectives(req.query);
	const searchString = String(req.query.query ?? "").trim();

	const result = await orderService.getUserOrders({ userId, searchString, limit, offset });

	if (!result){
		throw new AppError("User not found.", 404);
	}

	const responseData = {
		orders: result.orders,
		totalPages: Math.ceil(result.count / limit || 1)
	};

	return res.status(200).json({ success: true, data: responseData });
};

export const shipOrder = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const orderId = Number(req.params.id);

	if (isNaN(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	const updatedOrder = await orderService.markAsShipped(orderId, userId);

	return res.status(200).json({ success: true, data: updatedOrder });
};

export const refundOrder = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const orderId = Number(req.params.id);

	if (isNaN(orderId)) {
		throw new AppError("Invalid order ID", 400);
	}

	const refundedOrder = await orderService.refundOrder(orderId, userId);

	return res.status(200).json({ success: true, data: refundedOrder });
};