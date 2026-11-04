import { type Request, type Response } from "express";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/appError.js";

export const getMessages = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const { partnerId, offset } = req.query;

	if (partnerId === undefined) {
		throw new AppError("Invalid data", 400);
	}

	const parsedPartnerId = Number(partnerId);
	const parsedOffset = offset ? Number(offset) : 0;

	if (isNaN(parsedPartnerId)) {
		throw new AppError("Parameters must be valid numbers", 400);
	}

	const messages = await messageService.getMessages(
		userId,
		parsedPartnerId,
		parsedOffset
	);

	res.status(200).json({ success: true, messages });
};

export const getChats = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const data = await messageService.getChatsWithLastMessage(userId);

	res.status(200).json({success: true, data});
};

export const readMessage = async (req: Request, res: Response) => {
	const currentUserId = res.locals.user!.id;
	const partnerId = Number(req.body?.partnerId);

	if (isNaN(partnerId) || partnerId <= 0) {
		throw new AppError("Invalid partner ID", 400);
	}
	await messageService.isReadMessage(currentUserId, partnerId);

	res.status(200).json({ success: true, message: "Message updated successfully" });
};