import type { Request, Response } from "express";
import { getValidatedPost } from "@/utils/dataValidation.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";
import { AppError } from "@/utils/appError.js";
import { postService } from "@/services/post.service.js";

const readPosts = async (req: Request, res: Response, userId?: number) => {
	const {limit, offset} = getPaginationDirectives(req.query);
	const searchString = String(req.query.query ?? "").trim();
	const {posts, count} = await postService.getPosts({
		searchString,
		userId,
		limit,
		offset
	});

	return res.status(200).json({
		posts,
		totalCount: count,
		totalPages: Math.ceil(count / limit || 1),
	});
};

export const readAll = (req: Request, res: Response) => readPosts(req, res);

export const readMine = (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	return readPosts(req, res, req.user.id);
};

export const readOne = async (req: Request, res: Response) => {
	const {id} = req.params;
	if (!id) {
		throw new AppError("Post not found", 404);
	}

	const post = await postService.getPostById(Number(id), req.user?.id);
	if (!post) {
		throw new AppError("Post not found", 404);
	}

	return res.status(200).json(post);
};

export const create = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	const {title, excerpt, description} = getValidatedPost(req.body);

	const newPost = await postService.createPost({
		userId: req.user.id,
		title,
		excerpt,
		description,
	});

	if (!newPost || !newPost.get("id")) {
		throw new AppError("Failed to create post record", 500);
	}

	return res.status(201).json({success: true, message: "Post created successfully.", post: newPost});
};

export const update = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}
	if (!id) {
		throw new AppError("Post ID is required", 400);
	}
	const { title, excerpt, description } = getValidatedPost(req.body);
	const isUpdated = await postService.updatePost({
		id: Number(id),
		userId: req.user.id,
		title,
		excerpt,
		description
	});

	if (!isUpdated) {
		throw new AppError("Post not found", 404);
	}

	return res.status(200).json({success: true, message: "Post updated successfully!"});
};

export const remove = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!id) {
		throw new AppError("Post ID is required", 400);
	}

	if (!req.user) {
		throw new AppError("Authentication required. Please sign-in.", 401);
	}

	const isDeleted = await postService.deletePost(Number(id), req.user.id);
	if (!isDeleted) {
		throw new AppError("Post not found", 404);
	}
	return res.status(200).json({success: true, message: "Post deleted successfully!"});
};

export const toggleLike = async (req: Request, res: Response) => {
	const {id} = req.params;

	if (!id) {
		throw new AppError("Post not found", 404);
	}

	if (!req.user) {
		throw new AppError("Authentication required.", 401);
	}

	const result = await postService.toggleLike(Number(id), req.user.id);

	return res.status(200).json(result);
};