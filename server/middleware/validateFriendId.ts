import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError.js";

export const validateFriendship = (req: Request, res: Response, next: NextFunction) => {
	const userId = Number(res.locals.user!.id);
	const friendId = Number(req.body.friendId);

	if (!Number.isSafeInteger(userId) || !Number.isSafeInteger(friendId)) {
		throw new AppError("Invalid user identifiers provided", 400);
	}

	if (userId === friendId) {
		throw new AppError("You cannot perform this action on yourself", 400);
	}

	res.locals.friendId = friendId;
	next();
};