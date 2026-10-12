import type { Request, Response } from "express";
import { getValidatedPost } from "@/utils/dataValidation.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";
import { postService } from "@/services/post.service.js";

interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		name: string;
		email: string;
	};
}

const readPosts = async (req: Request, res: Response, userId?: number) => {
	try {
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
	} catch (error) {
		console.error("Error in readPosts:", error);
		return res.status(500).json({success: false, message: "Internal server error."});
	}
};

export const readAll = (req: Request, res: Response) => readPosts(req, res);

export const readMine = (req: AuthenticatedRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).json({success: false, message: "Authentication required. Please sign-in."});
	}
	return readPosts(req, res, req.user.id);
};

export const readOne = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		if (!id) {
			return res.status(404).json({success: false, message: "Post not found"});
		}

		const post = await postService.getPostById(Number(id));

		if (!post) {
			return res.status(404).json({success: false, message: "Post not found"});
		}

		return res.status(200).json(post);
	} catch (error) {
		console.error("Error in readOne:", error);
		return res.status(500).json({success: false, message: "Internal server error."});
	}
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({success: false, message: "Authentication required. Please sign-in."});
		}

		const {title, excerpt, description} = getValidatedPost(req.body);

		const newPost = await postService.createPost({
			userId: req.user.id,
			title,
			excerpt,
			description,
		});

		if (!newPost || !newPost.get("id")) {
			return res.status(500).json({success: false, message: "Failed to create post record"});
		}

		return res.status(201).json({success: true, message: "Post created successfully."});
	} catch (error) {
		console.error("Error in create post:", error);
		return res.status(500).json({success: false, message: "Internal server error."});
	}
};

export const update = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const {id} = req.params;
		if (!req.user) {
			return res.status(401).json({success: false, message: "Authentication required. Please sign-in."});
		}

		if (!id) {
			return res.status(400).json({success: false, message: "Post ID is required"});
		}

		const {title, excerpt, description} = getValidatedPost(req.body);

		const isUpdated = await postService.updatePost({
			id: Number(id),
			userId: req.user.id,
			title,
			excerpt,
			description
		});

		if (!isUpdated) {
			return res.status(404).json({success: false, message: "Post not found"});
		}

		return res.status(200).json({success: true, message: "Post updated successfully!"});
	} catch (error) {
		console.error("Error in update post:", error);
		return res.status(500).json({success: false, message: "Internal server error."});
	}
};

export const remove = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const {id} = req.params;
		if (!id) {
			return res.status(400).json({success: false, message: "Post ID is required"});
		}

		if (!req.user) {
			return res.status(401).json({success: false, message: "Authentication required. Please sign-in."});
		}

		const isDeleted = await postService.deletePost(Number(id), req.user.id);

		if (!isDeleted) {
			return res.status(404).json({success: false, message: "Post not found"});
		}

		return res.status(200).json({success: true, message: "Post deleted successfully!"});
	} catch (error) {
		console.error("Error in remove post:", error);
		return res.status(500).json({success: false, message: "Internal server error."});
	}
};
