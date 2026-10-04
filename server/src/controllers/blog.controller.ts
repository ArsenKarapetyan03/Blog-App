import type { Request, Response } from "express";
import type { PostType } from "@/types/types";
import { DATA_URL } from "@/server/config/endpoint.js";
import { validatePostForm } from "@/utils/validatePostForm";

export const getPosts = async (_req: Request, res: Response) => {
	try {
		const response = await fetch(DATA_URL);

		if (!response.ok) {
			throw new Error(`Failed to get posts: ${response.statusText}`);
		}

		const posts = (await response.json()) as PostType[];
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: error instanceof Error ? error.message : "Internal Server Error",
		});
	}
};

export const createPost = async (req: Request, res: Response) => {
	const { formData } = req.body;
	const validatedData = validatePostForm(formData as FormData);

	if (!validatedData) {
		return res.status(400).json({ success: false, msg: "Please fill in all required fields." });
	}

	const newPost: PostType = {
		...validatedData,
		id: crypto.randomUUID(),
		author: "User1234",
		date: new Date().toLocaleDateString("en-CA"),
	};

	try {
		const response = await fetch(DATA_URL, {
			method: "POST",
			body: JSON.stringify(newPost),
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			return res.status(400).json({ success: false, msg: "Failed to create post." });
		}

		return res.status(201).json({ success: true, msg: "Post created successfully!", post: newPost });
	} catch (error) {
		console.error("Create Post Error:", error);
		return res.status(500).json({ success: false, msg: "Server error. Please try again later." });
	}
};

export const updatePost = async (req: Request, res: Response) => {
	const { formData } = req.body;
	const id = formData.get("id")?.toString();
	const validatedData = validatePostForm(formData as FormData);

	if (!id || !validatedData) {
		return res.status(400).json({ success: false, msg: "Invalid or missing data for update." });
	}

	try {
		const response = await fetch(`${DATA_URL}/${id}`, {
			method: "PUT",
			body: JSON.stringify(validatedData),
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			return res.status(400).json({ success: false, msg: "Failed to update post." });
		}

		return res.json({ success: true, msg: "Post updated successfully!" });
	} catch (error) {
		console.error("Update Post Error:", error);
		return res.status(500).json({ success: false, msg: "Server error. Please try again later." });
	}
};

export const deletePost = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ success: false, msg: "Invalid post ID." });
	}

	try {
		const response = await fetch(`${DATA_URL}/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			return res.status(400).json({ success: false, msg: "Failed to delete post." });
		}

		return res.json({ success: true, msg: "Post deleted successfully!" });
	} catch (error) {
		console.error("Delete Post Error:", error);
		return res.status(500).json({ success: false, msg: "Server error. Please try again later." });
	}
};