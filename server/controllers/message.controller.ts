import { type Request, type Response } from "express";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

export const getMessages = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const { chatId, offset } = req.query;

	if (chatId === undefined) {
		throw new AppError("Invalid data", 400);
	}

	const parsedChatId = Number(chatId);
	const parsedOffset = offset ? Number(offset) : 0;

	if (isNaN(parsedChatId)) {
		throw new AppError("Parameters must be valid numbers", 400);
	}

	const messages = await messageService.getMessages(
		parsedChatId,
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