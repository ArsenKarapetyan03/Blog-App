import type { Request, Response } from "express";
import { chatService } from "@/services/chat.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

export const getChats = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const chatList = await chatService.getChats(userId);

	res.status(200).json({
		success: true,
		count: chatList.length,
		data: chatList,
	});
}

export const createChat = async (req: Request, res: Response) => {
	const creatorId = res.locals.user!.id;

	const { title, participantIds } = req.body;

	if (!title || typeof title !== "string" || title.trim() === "") {
		throw new AppError("Validation Error: 'title' is required and must be a valid string", 400);
	}

	if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
		throw new AppError("Validation Error: 'participantIds' must be a non-empty array of user IDs", 400);
	}

	const uniqueParticipantIds = Array.from(new Set(participantIds))
		.map(Number)
		.filter((id) => id !== creatorId && !isNaN(id));

	if (uniqueParticipantIds.length === 0) {
		throw new AppError("Validation Error: You must invite at least one other valid user", 400);
	}

	const newGroupChat = await chatService.createGroupChat(creatorId, title.trim(), uniqueParticipantIds);

	res.status(201).json({
		success: true,
		data: {
			id: newGroupChat.id,
			title: newGroupChat.title,
			isGroup: newGroupChat.isGroup,
			createdAt: newGroupChat.createdAt,
		},
	});

}