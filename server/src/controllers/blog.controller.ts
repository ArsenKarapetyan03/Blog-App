import type { Request, Response } from "express";
import type { PostType } from "@/types/types";
import { getValidatedPost } from "@/utils/dataValidation";
import { sendError } from "@/utils/apiHelpers";
import Post from "@models/posts.js";

export const readAll = async (req: Request, res: Response) => {
	try {
		const posts: PostType[] = await Post.findAll();

		return res.status(200).json(posts);
	} catch (error) {
		return sendError(res, error, 500);
	}
};

export const readOne = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;

		if (!id) {
			throw new Error("Invalid id");
		}

		const post = await Post.findByPk(id);

		console.log(post[0]);

		if (post.length === 0) {
			throw new Error("Post not found");
		}

		return res.status(200).json(post[0]);
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";

		return sendError(res, error, isNotFound ? 404 : 500);
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const post: PostType = req.body;

		const {title, excerpt, description} = getValidatedPost(post);

		const newPost = {
			...post,
			author: "user1234",
			date: new Date(),
			title,
			excerpt,
			description,
		};

		const [insertedRow] = await sql`
        INSERT INTO posts (author, date, title, excerpt, description)
        VALUES (${newPost.author}, ${newPost.date}, ${newPost.title}, ${newPost.excerpt}, ${newPost.description}) RETURNING id;
		`;

		if (!insertedRow) {
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
		const {title, excerpt, description} = getValidatedPost(req);

		const result = await sql`
        UPDATE posts
        SET title = ${title},
            excerpt = ${excerpt},
            description = ${description}
        WHERE id = ${id} RETURNING id;
		`;

		if (result.length === 0) {
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

		const result = await sql`
        DELETE
        FROM posts
        WHERE id = ${id} RETURNING id;
		`;

		if (result.length === 0) {
			throw new Error("Post not found");
		}

		return res.status(200).json({ success: true, message: "Post deleted successfully!" });
	} catch (error) {
		const isNotFound = error instanceof Error && error.message === "Post not found";
		return sendError(res, error, isNotFound ? 404 : 500);
	}
};