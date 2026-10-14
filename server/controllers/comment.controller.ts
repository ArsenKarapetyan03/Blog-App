import type { Request, Response } from "express";
import { AppError } from "@/utils/appError.js";
import { commentService } from "@/services/comment.service.js";

export const create = async (req: Request, res: Response) => {
	const {content, postId, replyId} = req.body;

	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	const userId = req.user.id;

	if (!content || !postId) {
		throw new AppError("Content and postId are required", 400);
	}

	if (replyId) {
		const parentComment = await commentService.findById(replyId);
		if (!parentComment) {
			throw new AppError("Parent comment not found", 404);
		}
	}


	const comment = await commentService.createComment({
		content,
		postId: Number(postId),
		userId: Number(userId),
		replyId: replyId ? replyId : null
	});

	return res.status(201).json(comment);
};
