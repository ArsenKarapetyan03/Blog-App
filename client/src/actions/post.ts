"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { BASE_URL } from "@/config/api";

export const createPost = async (formData: FormData) => {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		const response = await fetch(`${BASE_URL}/blog`, {
			method: "POST",
			body: formData,
			headers: {
				"Authorization": `Bearer ${token}`,
			}
		});

		if (!response.ok) {
			return {success: false, message: "Failed to create post."};
		}

		return {success: true, message: "Post created successfully!"};
	} catch (error) {
		return {success: false, message: "Failed to create post."};
	}
}

export const updatePost = async (formData: FormData) => {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		const id = formData.get("id");
		if (typeof id !== "string" || !id) {
			return {success: false, message: "Invalid or missing data for update."};
		}

		const plainFormData = {
			title: String(formData.get("title") ?? ""),
			excerpt: String(formData.get("excerpt") ?? ""),
			description: String(formData.get("description") ?? ""),
		};

		const response = await fetch(`${BASE_URL}/blog/${id}`, {
			method: "PATCH",
			body: JSON.stringify(plainFormData),
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			return {success: false, message: "Failed to update post."};
		}
		return {success: true, message: "Post updated successfully!"};
	} catch (error) {
		return {success: false, message: "Failed to update post."};
	}
}

export const deletePost = async (id: string) => {
	try {
		if (!id) {
			return {success: false, message: "Invalid post ID."};
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
			return {success: false, message: "Failed to delete post."};
		}

		return {success: true, message: "Post deleted successfully!"};
	} catch (error) {
		return {success: false, message: "Failed to delete post."};
	}
};

export const toggleLikeAction = async (postId: number) => {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return {success: false, message: "Unauthorized"};
		}

		const response = await fetch(`${BASE_URL}/blog/${postId}/like`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			return {success: false, message: "Failed to like post."};
		}

		revalidatePath(`/posts/${postId}`);

		return {success: true};
	} catch (error) {
		return {success: false, message: "Failed to toggle like post."};
	}
}