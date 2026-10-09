import type { Request, Response } from "express";
import type { PostType } from "@/types/types.js";
import { getValidatedPost } from "@/utils/dataValidation.js";
import { sendError } from "@/utils/apiHelpers.js";
import { Op } from "sequelize";
import db from "@/models";

export const readOne = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const post = await db.Post.findByPk(id, {
			include: [
				{
					model: db.User,
					as: "User",
					attributes: ["name"]
				}
			]
		});

		if (!post) {
			throw new Error("Post not found");
		}

		return res.status(200).json(post.toJSON());
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";

		return sendError(res, error, isNotFound ? 404 : 500);
	}
};

export const readAll = async (req: Request, res: Response) => {
	try {
		const requestedPage = Number(req.query.page);
		const requestedLimit = Number(req.query.limit);

		const page = Math.max(1, Number(requestedPage) || 1);
		const limit = Math.min(100, Math.max(1, Number(requestedLimit) || 4));
		const query = String(req.query.query ?? "").trim();

		const {rows, count} = await db.Post.findAndCountAll({
			include: [
				{
					model: db.User,
					as: "User",
					attributes: ["name"]
				}
			],
			where: query ? {
				[Op.or]: [
					{description: {[Op.iLike]: `%${query}%`}},
					{title: {[Op.iLike]: `%${query}%`}}
				]
			} : {},
			limit,
			offset: (page - 1) * limit,
			order: [["createdAt", "DESC"]],
		});

		const posts: PostType[] = rows.map(post => post.toJSON() as PostType);

		return res.status(200).json({
			posts,
			totalCount: count,
			totalPages: Math.ceil(count / limit),
		});
	} catch (error) {
		return sendError(res, error, 500);
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const post: PostType = req.body;

		const {title, excerpt, description} = getValidatedPost(post);

		const newPost = await db.Post.create({
			author: "user1234",
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
		const {title, excerpt, description} = getValidatedPost(req.body);

		const [affectedCount] = await db.Post.update(
			{title, excerpt, description},
			{
				where: {id},
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

		const result = await db.Post.destroy({
			where: {id},
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