import type { Request, Response } from "express";
import { Op } from "sequelize";
import db from "@/models/index.js";
import { getValidatedPost } from "@/utils/dataValidation.js";
import { sendError } from "@/utils/apiHelpers.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js"

const readPosts = async (req: Request, res: Response, userId?: string) => {
	try {
		const {limit, offset} = getPaginationDirectives(req.query);
		const searchString = String(req.query.query ?? "").trim();
		const searchQuery = searchString ? {
			[Op.or]: [
				{ description: { [Op.iLike]: `%${searchString}%` } },
				{ title: { [Op.iLike]: `%${searchString}%` } }
			]
		} : {};

		const {rows, count} = await db.Post.findAndCountAll({
			where: {...searchQuery, ...(userId ? {userId} : {})},
			limit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		const posts = rows.map(post => post.toJSON());

		return res.status(200).json({
			posts,
			totalCount: count,
			totalPages: Math.ceil(count / limit),
		});
	} catch (error) {
		return sendError(res, error, 500);
	}
};


export const readAll = (req: Request, res: Response) => readPosts(req, res);

export const readOne = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;

		if (!id) {
			throw new Error("Post not found");
		}

		const post = await db.Post.findByPk(String(id));

		if (!post) {
			throw new Error("Post not found");
		}

		return res.status(200).json(post.toJSON());
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";

		return sendError(res, error, isNotFound ? 404 : 500);
	}
};

export const readMine = (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({message: "Authentication required. Please sign-in."});
	}

	return readPosts(req, res, req.user.id);
};

export const create = async (req: Request, res: Response) => {
	try {
		const post = req.body;

		const {title, excerpt, description} = getValidatedPost(post);

		const newPost = await db.Post.create({
			userId: Number(req.user?.id),
			title,
			excerpt,
			description,
		});

		if (!newPost.id) {
			throw new Error("Failed to create post record");
		}

		return res.status(201).json({success: true, message: "Post created successfully."});
	} catch (error) {
		return sendError(res, error, 400);
	}
};

export const update = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const userId = Number(req.user?.id);

		const {title, excerpt, description} = getValidatedPost(req.body);

		const [affectedCount] = await db.Post.update(
			{title, excerpt, description},
			{
				where: {id, userId},
				returning: true
			}
		);

		if (affectedCount === 0) {
			throw new Error("Post not found");
		}

		return res.status(200).json({success: true, message: "Post updated successfully!"});
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";

		return sendError(res, error, isNotFound ? 404 : 400);
	}
};

export const remove = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;

		if (!id) {
			throw new Error("Post ID is required");
		}

		const userId = Number(req.user?.id);

		const result = await db.Post.destroy({
			where: {id, userId},
		});

		if (result === 0) {
			throw new Error("Post not found");
		}

		return res.status(200).json({ success: true, message: "Post deleted successfully!" });
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";
		return sendError(res, error, isNotFound ? 404 : 500);
	}
};