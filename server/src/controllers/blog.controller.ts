import type { Request, Response } from "express";
import type { PostType } from "@/types/types";
import { getValidatedPost } from "@/utils/dataValidation";
import { sendError } from "@/utils/apiHelpers";
import { sql } from "@/config/db.js";

export const getPosts = async (req: Request, res: Response) => {
	try {
		const posts: PostType[] = await sql`SELECT * FROM posts`;

		return res.status(200).json(posts);
	} catch (error) {
		return sendError(res, error, 500);
	}
};

export const getPost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const post =
			await sql`
          SELECT *
          FROM posts
          WHERE id = ${id}
			`;

		return res.status(200).json(post[0]);
	} catch (error) {
		return sendError(res, error, 500);
	}
};

export const createPost = async (req: Request, res: Response) => {
	try {
		const post = req.body;
		const {title, excerpt, description} = getValidatedPost(req);

		const newPost = {
			...post,
			title,
			excerpt,
			description,
		}

		await sql`
        INSERT INTO posts (id, author, date, title, excerpt, description)
        VALUES (${newPost.id}, ${newPost.author}, ${newPost.date}, ${newPost.title}, ${newPost.excerpt}, ${newPost.description})
		`;

		return res.status(201).json({success: true, message: "Post created successfully."});
	} catch (error) {
		return sendError(res, error, 400);
	}
};

export const updatePost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const {title, excerpt, description} = getValidatedPost(req);

		await sql`
			UPDATE posts 
			SET title = ${title}, excerpt = ${excerpt}, description = ${description} 
			WHERE id = ${id}
		`;

		return res.status(200).json({success: true, message: "Post updated successfully!"});
	} catch (error) {
		return sendError(res, error, 400);
	}
};

export const deletePost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;

		if (!id) {
			throw new Error("Post ID is required");
		}

		await sql`
			DELETE FROM posts 
			WHERE id = ${id}
		`;

		return res.status(200).json({success: true, message: "Post deleted successfully!"});
	} catch (error) {
		return sendError(res, error, 500, "Delete Post Error");
	}
};