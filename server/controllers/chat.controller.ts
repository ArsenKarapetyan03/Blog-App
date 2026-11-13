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
	const participantIds = req.body?.participantIds;
	const isGroup = req.body?.isGroup;
	const title = req.body?.title;

	if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
		throw new AppError("Validation Error: 'participantIds' must be a non-empty array of user IDs", 400);
	}

	const uniqueParticipantIds = Array.from(new Set(participantIds))
		.map(Number)
		.filter((id) => id !== creatorId && !isNaN(id));

	if (uniqueParticipantIds.length === 0) {
		throw new AppError("Validation Error: You must invite at least one other valid user", 400);
	}

	if (isGroup || participantIds.length > 2) {
		const newGroupChat = await chatService.createGroupChat(creatorId, title ? title.trim() : null, uniqueParticipantIds);

		if (!newGroupChat) {
			throw new AppError("Internal server error", 500);
		}

		return res.status(201).json({
			success: true,
			data: {
				id: newGroupChat.id,
				title: newGroupChat.title,
				isGroup: true,
				users: newGroupChat.users || [],
				adminId: newGroupChat.adminId,
				createdAt: newGroupChat.createdAt,
			},
		});
	} else {
		const targetUserId = uniqueParticipantIds[0];

		if (!targetUserId) {
			throw new AppError("Invalid userId", 400);
		}

		const personalChat = await chatService.findOrCreate1to1Chat(creatorId, targetUserId);

		if (!personalChat) {
			throw new AppError("Internal server error", 500);
		}

		return res.status(200).json({
			success: true,
			data: {
				id: personalChat.id,
				name: personalChat.name,
				isGroup: false,
				users: personalChat.users || [],
				createdAt: personalChat.createdAt,
			},
		});
	}
};

export const updateGroupChat = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;

	const title = req.body?.title;
	const chatId = Number(req.body?.chatId);

	if (!title || !title.trim() || !chatId || isNaN(chatId)) {
		throw new AppError("Invalid data", 400);
	}

	const updatedChat = await chatService.updateGroupChat(userId, chatId, title);
	if (!updatedChat) {
		throw new AppError("Internal server error", 500);
	}

	return res.status(200).json({
		success: true,
		message: "Group chat updated successfully.",
	});
};

export const addChatMembers = async (	req: Request,	res: Response) => {
	const userId = res.locals.user!.id;
	const chatId = Number(req.body?.chatId);
	const memberIds = req.body?.memberIds;

	if (!chatId || isNaN(chatId) || !Array.isArray(memberIds) || memberIds.length === 0) {
		throw new AppError("Invalid chatId and empty array of memberIds.", 400);
	}

	await chatService.addChatMembers(userId, chatId, memberIds.map(Number));

	return res.status(201).json({
		success: true,
		message: "Members added successfully."
	});
}

export const deleteChatMember = async (req: Request, res: Response) => {
	const userId = res.locals.user!.id;
	const chatId = Number(req.body?.chatId);
	const memberId = Number(req.body?.memberId);

	if (!chatId || isNaN(chatId) || !memberId || isNaN(memberId)) {
		throw new AppError("Invalid data", 400);
	}

	await chatService.deleteChatMember(userId, memberId, chatId);

	return res.status(200).json({
		success: true,
		message: "Member removed from chat successfully"
	});
}