"use server"

import { revalidatePath } from "next/cache";
import { PostType } from "@/types/types";
import { DATA_URL } from "@/utils/endpoint";

export type ActionResponse = { success: boolean; msg: string };

function validatePostForm(formData: FormData) {
	const title = formData.get("title")?.toString().trim();
	const excerpt = formData.get("excerpt")?.toString().trim();
	const description = formData.get("description")?.toString().trim();

	if (!title || !excerpt || !description) {
		return null;
	}

	return {title, excerpt, description};
}

export async function createPost(formData: FormData): Promise<ActionResponse> {
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

export async function updatePost(formData: FormData): Promise<ActionResponse> {
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

export async function deletePost(id: string): Promise<ActionResponse> {
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