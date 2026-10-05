"use server"

import { revalidatePath } from "next/cache";
import { type PostType } from "@/types/types";
import { validatePostForm } from "@/utils/validatePostForm";
import { DATA_URL } from "@/config/api";

export type ActionResponse = {success: boolean; message: string};

export const createPost = async (formData: FormData): Promise<ActionResponse> => {
	const validatedData = validatePostForm(formData);

	if (!validatedData) {
		return {success: false, message: "Please fill in all required fields."};
	}

	const newPost: PostType = {
		...validatedData,
		id: crypto.randomUUID(),
		author: "User1234",
		date: new Date().toLocaleDateString("en-CA"),
	};

	try {
		const response = await fetch(`${DATA_URL}add`, {
			method: "POST",
			body: JSON.stringify(newPost),
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
	const validatedData = validatePostForm(formData);

	if (!id || !validatedData) {
		return { success: false, message: "Invalid or missing data for update." };
	}

	try {
		const response = await fetch(`${DATA_URL}edit/${id}`, {
			method: "PUT",
			body: JSON.stringify(validatedData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, message: "Failed to update post."};
		}

		// revalidatePath("/");
		// revalidatePath(`/posts/${id}`);

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
		const response = await fetch(`${DATA_URL}delete/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			return {success: false, message: "Failed to delete post."};
		}

		// revalidatePath("/");

		return {success: true, message: "Post deleted successfully!"};
	} catch (error) {
		console.error("Delete Post Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}