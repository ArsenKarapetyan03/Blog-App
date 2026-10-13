"use server"

import { cookies } from "next/headers";
import { type PostType } from "@/types/types";
import { BASE_URL } from "@/config/api";

export const createPost = async (plainFormData: Partial<PostType>) => {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	console.log(token);
	console.log(plainFormData);

	const response = await fetch(`${BASE_URL}/blog`, {
		method: "POST",
		body: JSON.stringify(plainFormData),
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		}
	});

	if (!response.ok) {
		return {success: false, message: "Failed to create post."};
	}

	return {success: true, message: "Post created successfully!"};
}

export const updatePost = async (plainFormData: Partial<PostType>) => {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!plainFormData.id) {
		return {success: false, message: "Invalid or missing data for update."};
	}

	const response = await fetch(`${BASE_URL}/blog/${plainFormData.id}`, {
		method: "PATCH",
		body: JSON.stringify(plainFormData),
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		}
	});

	if (!response.ok) {
		return { success: false, message: "Failed to update post." };
	}
	return { success: true, message: "Post updated successfully!" };
}

export const deletePost = async (id: string) => {
	if (!id) {
		return { success: false, message: "Invalid post ID." };
	}

	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	const response = await fetch(`${BASE_URL}/blog/${id}`, {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		}
	});

	if (!response.ok) {
		return { success: false, message: "Failed to delete post." };
	}

	return { success: true, message: "Post deleted successfully!" };
}