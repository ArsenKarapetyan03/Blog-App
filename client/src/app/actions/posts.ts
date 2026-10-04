"use server"

import { revalidatePath } from "next/cache";
import { PostType } from "@shared/types/types";
import { DATA_URL } from "@/utils/endpoint";
import { validatePostForm } from "@shared/utils/validatePostForm";

export type ActionResponse = { success: boolean; msg: string };

export const createPost = async (formData: FormData): Promise<ActionResponse> => {
	const validatedData = validatePostForm(formData);

	if (!validatedData) {
		return { success: false, msg: "Please fill in all required fields." };
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
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, msg: "Failed to create post."};
		}

		revalidatePath("/");

		return {success: true, msg: "Post created successfully!"};
	} catch (error) {
		console.error("Create Post Error:", error);
		return {success: false, msg: "Server error. Please try again later."};
	}
}

export const updatePost = async (formData: FormData): Promise<ActionResponse> => {
	const id = formData.get("id")?.toString();
	const validatedData = validatePostForm(formData);

	if (!id || !validatedData) {
		return { success: false, msg: "Invalid or missing data for update." };
	}

	try {
		const response = await fetch(`${DATA_URL}/${id}`, {
			method: "PUT",
			body: JSON.stringify(validatedData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, msg: "Failed to update post."};
		}

		revalidatePath("/");
		revalidatePath(`/posts/${id}`);

		return { success: true, msg: "Post updated successfully!" };
	} catch (error) {
		console.error("Update Post Error:", error);
		return { success: false, msg: "Server error. Please try again later." };
	}
}

export const deletePost = async (id: string): Promise<ActionResponse> => {
	if (!id) {
		return {success: false, msg: "Invalid post ID."};
	}

	try {
		const response = await fetch(`${DATA_URL}/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			return {success: false, msg: "Failed to delete post."};
		}

		revalidatePath("/");

		return { success: true, msg: "Post deleted successfully!" };
	} catch (error) {
		console.error("Delete Post Error:", error);
		return { success: false, msg: "Server error. Please try again later." };
	}
}