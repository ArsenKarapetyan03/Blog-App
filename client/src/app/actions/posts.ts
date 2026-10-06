"use server"

import { type PostType } from "@/types/types";
import { DATA_URL } from "@/config/api";

export type ActionResponse = {success: boolean; message: string};

export const createPost = async (formData: FormData): Promise<ActionResponse> => {
	try {
		const plainFormData = Object.fromEntries(formData.entries());

		const response = await fetch(`${DATA_URL}/post`, {
			method: "POST",
			body: JSON.stringify(plainFormData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, message: "Failed to create post."};
		}

		return {success: true, message: "Post created successfully!"};
	} catch (error) {
		console.error("Create Post Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}

export const updatePost = async (formData: FormData): Promise<ActionResponse> => {
	const id = formData.get("id")?.toString();

	if (!id) {
		return { success: false, message: "Invalid or missing data for update." };
	}

	const plainFormData = Object.fromEntries(formData.entries());

	try {
		const response = await fetch(`${DATA_URL}/post/${id}`, {
			method: "PUT",
			body: JSON.stringify(plainFormData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, message: "Failed to update post."};
		}

		return {success: true, message: "Post updated successfully!"};
	} catch (error) {
		console.error("Update Post Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}

export const deletePost = async (id: string): Promise<ActionResponse> => {
	if (!id) {
		return {success: false, message: "Invalid post ID."};
	}

	try {
		const response = await fetch(`${DATA_URL}/post/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			return {success: false, message: "Failed to delete post."};
		}

		return {success: true, message: "Post deleted successfully!"};
	} catch (error) {
		console.error("Delete Post Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}