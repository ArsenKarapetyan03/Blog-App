import type { Request, Response } from "express";
import type { PostType } from "@/types/types";
import { DATA_URL } from "./endpoint";
import { validatePostForm } from "@/utils/dataValidation";


export const getPosts = async (req: Request, res: Response) => {
	try {
		const response = await fetch(DATA_URL);

		if (!response.ok) {
			throw new Error(`Failed to get posts: ${response.statusText}`);
		}

		const posts: PostType[] = (await response.json());
		res.json(posts);
	} catch (error) {
		console.error(error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		res.status(500).json({success: false, message: errorMessage});
	}
};

export const getPost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const response = await fetch(`${DATA_URL}${req.params.id}`);

		if (!response.ok) {
			throw new Error(`Failed to get post: ${response.statusText}`);
		}

		const post: PostType = await response.json();

		res.json(post);
	} catch (error) {
		console.error(error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		res.status(500).json({success: false, message: errorMessage});
	}
}

export const createPost = async (req: Request, res: Response) => {
	try {
		const postData: PostType = req.body;

		if (!postData || Object.keys(postData).length === 0) {
			throw new Error("Invalid Body");
		}

		const validatedData = validatePostForm(postData);

		if (!validatedData) {
			throw new Error("Invalid data");
		}

		const newPost: PostType = {
			...postData,
			...validatedData
		};

		const response = await fetch(DATA_URL, {
			method: "POST",
			body: JSON.stringify(newPost),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to create post: ${response.statusText}`);
		}

		res.status(201).json({success: true, message: "Post created successfully."});
	} catch (error) {
		console.error(error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		res.status(400).json({success: false, message: errorMessage});
	}
};

export const updatePost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;
		const postData: PostType = req.body;

		if (!postData || Object.keys(postData).length === 0) {
			throw new Error("Invalid Body");
		}

		const validatedData = validatePostForm(postData);

		if (!validatedData) {
			throw new Error("Invalid data");
		}

		const response = await fetch(`${DATA_URL}${id}`, {
			method: "PUT",
			body: JSON.stringify(postData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			throw new Error("Failed to update post.");
		}

		return res.json({success: true, message: "Post updated successfully!"});
	} catch (error) {
		console.error("Update Post Error:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return res.status(400).json({success: false, message: `Failed to update post: ${errorMessage}`});
	}
}

export const deletePost = async (req: Request, res: Response) => {
	try {
		const {id} = req.params;

		if (!id) {
			throw new Error("Post ID is required");
		}

		const response = await fetch(`${DATA_URL}${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error("Failed to delete post.");
		}

		return res.json({success: true, message: "Post deleted successfully!"});
	} catch (error) {
		console.error("Delete Post Error:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return res.status(500).json({success: false, message: `Server error. Please try again later. ${errorMessage}`});
	}
};