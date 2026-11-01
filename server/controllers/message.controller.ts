import { type Request, type Response, text } from "express";
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

	const messages = await messageService.getMessage(
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
}

export const createMessage = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid data", 400);
	}

	const senderId = res.locals.user!.id;
	const receiverId = Number(req.body.partnerId);
	const text = String(req.body.messageText || "").trim();

	if (!receiverId || isNaN(receiverId) || !text) {
		throw new AppError("Invalid data", 400);
	}

	if (senderId === receiverId) {
		throw new AppError("You cannot send a message to yourself", 400);
	}

	const newMessage = await messageService.createMessage(senderId, receiverId, text);


	res.status(201).json({ success: true, message: newMessage });
};

export const readMessage = async (req: Request, res: Response) => {
	if (!req.body) {
		throw new AppError("Invalid data", 400);
	}

	const senderId = res.locals.user!.id;
	const receiverId = Number(req.body.partnerId);

	if (!receiverId || isNaN(receiverId)) {
		throw new AppError("Invalid data", 400);
	}

	const response = await messageService.updateMessage(senderId, receiverId, { isRead: true });

	if (!response) {
		throw new AppError("Unable to update message", 400);
	}

	res.status(200).json({ success: true, message: "Message updated successfully" });
};