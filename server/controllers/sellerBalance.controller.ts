import type { Request, Response } from "express";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { sellerBalanceService } from "@/services/sellerBalance.service.js";

export const getBalance = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const balance = await sellerBalanceService.getBalance(userId);

	return res.status(200).json({	success: true, data: balance	});
}