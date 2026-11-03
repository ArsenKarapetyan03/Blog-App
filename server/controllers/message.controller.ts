import { type Request, type Response } from "express";
import { messageService } from "@/services/db.services/message.service.js";
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
	const senderId = res.locals.user!.id;
	const receiverId = Number(req.body?.partnerId);
	const text = String(req.body?.messageText || "").trim();

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
	const currentUserId = res.locals.user!.id;
	const partnerId = Number(req.body?.partnerId);

	if (isNaN(partnerId) || partnerId <= 0) {
		throw new AppError("Invalid partner ID", 400);
	}
	await messageService.isReadMessage(currentUserId, partnerId, { isRead: true });

	res.status(200).json({ success: true, message: "Message updated successfully" });
};

export const updateMessage = async (req: Request, res: Response) => {
	const currentUserId = res.locals.user!.id;
	const messageId = Number(req.body?.messageId);
	const messageText = String(req.body.messageText || "").trim();

	if (isNaN(messageId) || messageId <= 0 || !messageText) {
		throw new AppError("Invalid data provided", 400);
	}

	const affectedCount = await messageService.updateMessage(currentUserId, messageId, messageText);

	if (affectedCount === 0) {
		throw new AppError("Message not found", 404);
	}

	res.status(200).json({ success: true, message: "Message updated successfully" });
}

export const deleteMessage = async (req: Request, res: Response) => {
	const currentUserId = res.locals.user!.id;
	const messageId = Number(req.body?.messageId);

	if (isNaN(messageId) || messageId <= 0) {
		throw new AppError("Invalid data provided", 400);
	}

	const deletedCount = await messageService.deleteMessage(currentUserId, messageId);

	if (deletedCount === 0) {
		throw new AppError("Message not found", 404);
	}

	res.status(200).json({ success: true, message: "Message deleted successfully" });
};