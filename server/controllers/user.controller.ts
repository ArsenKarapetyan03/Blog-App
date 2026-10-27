import type { Request, Response } from "express";
import { userService } from "@/services/user.service.js";
import { AppError } from "@/utils/appError.js"

export const getAll = async (req: Request, res: Response) => {
	const users = await userService.findAll();

	if (users?.length === 0) {
		throw new AppError("User not found.", 404);
	}

	return res.status(200).json({ success: true, users });
}

export const getUser = async (req: Request, res: Response) => {
	const user = res.locals.user;
	if (!user) {
		throw new AppError("Unauthorized. User data not found in request.", 401);
	}

	const foundUser = await userService.findById(user.id);
	if (!foundUser) {
		throw new AppError("User not found.", 404);
	}

	return res.status(200).json({
		success: true,
		user: {
			id: foundUser.id,
			name: foundUser.name,
			email: foundUser.email
		},
		Friends: foundUser.Friends
	});
};
