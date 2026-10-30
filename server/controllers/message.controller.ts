import type { Request, Response } from "express";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/appError.js";

export const getMessages = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const { partnerId, offset, limit } = req.query;

	if (partnerId === undefined || offset === undefined || limit === undefined) {
		throw new AppError("Invalid data", 400);
	}

	const parsedPartnerId = Number(partnerId);
	const parsedLimit = Number(limit);
	const parsedOffset = Number(offset);

	if (isNaN(parsedPartnerId) || isNaN(parsedLimit) || isNaN(parsedOffset)) {
		throw new AppError("Parameters must be valid numbers", 400);
	}

	const messages = await messageService.getMessage(
		userId,
		parsedPartnerId,
		parsedLimit,
		parsedOffset
	);

	res.status(200).json({ success: true, messages });
};

export const getChats = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const data = await messageService.getChatsWithLastMessage(userId);

	if (data.length === 0) {
		throw new AppError("No message found.", 404);
	}

	res.status(200).json({success: true, data});
}

export const createMessage = async (req: Request, res: Response) => {
	const senderId = res.locals.user!.id;

	const { receiverId, messageText } = req.body;

	if (!receiverId || !messageText || String(messageText).trim() === "") {
		throw new AppError("Receiver ID and message text are required", 400);
	}

	const parsedReceiverId = Number(receiverId);

	if (isNaN(parsedReceiverId)) {
		throw new AppError("Receiver ID must be a valid number", 400);
	}

	if (senderId === parsedReceiverId) {
		throw new AppError("You cannot send a message to yourself", 400);
	}

	const newMessage = await messageService.createMessage(
		senderId,
		parsedReceiverId,
		String(messageText).trim()
	);

	res.status(201).json({ success: true, message: newMessage });
};
