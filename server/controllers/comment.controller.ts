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

	const normalizedPostId = Number(postId);
	if (!Number.isInteger(normalizedPostId) || normalizedPostId <= 0) {
		throw new AppError("A valid postId is required", 400);
	}

	let normalizedReplyId: number | null = null;
	if (replyId !== undefined && replyId !== null && replyId !== "") {
		normalizedReplyId = Number(replyId);

		if (!Number.isInteger(normalizedReplyId) || normalizedReplyId <= 0) {
			throw new AppError("A valid replyId is required", 400);
		}

		const parentComment = await commentService.findById(normalizedReplyId);

		if (!parentComment) {
			throw new AppError("Parent comment not found", 404);
		}

		if (parentComment.postId !== normalizedPostId) {
			throw new AppError("Replies must belong to the same post as their parent comment", 400);
		}
	}

	const comment = await commentService.createComment({
		content,
		postId: normalizedPostId,
		userId: Number(userId),
		replyId: normalizedReplyId
	});

	return res.status(201).json(comment);
};

export const get = async (req: Request, res: Response) => {
	const commentId = Number(req.params.id);

	if (!Number.isInteger(commentId) || commentId <= 0) {
		throw new AppError("Comment not found", 404);
	}

	const comment = await commentService.findById(commentId);
	if (!comment) {
		throw new AppError("Comment not found", 404);
	}

	const pending = [...await commentService.getCommentsTree(comment.postId)];
	while (pending.length > 0) {
		const current = pending.pop();
		if (!current) {
			continue;
		}

		if (current.id === commentId) {
			return res.status(200).json(current);
		}
		pending.push(...(current.Replies ?? []));
	}

	throw new AppError("Comment not found", 404);
};