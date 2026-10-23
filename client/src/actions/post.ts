"use client"

import Cookies from "js-cookie";
import { NEXT_PUBLIC_BASE_URL } from "@/config/api";

export const createPost = async (formData: FormData) => {
	try {
		const token = Cookies.get("token");

		const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/blog`, {
			method: "POST",
			body: formData,
			headers: {"Authorization": `Bearer ${token}`}
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
		const token = Cookies.get("token");

		const id = formData.get("id");
		if (typeof id !== "string" || !id) {
			return {success: false, message: "Invalid or missing data for update."};
		}

		const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/blog/${id}`, {
			method: "PATCH",
			body: formData,
			headers: {"Authorization": `Bearer ${token}`}
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

		const token = Cookies.get("token");

		const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/blog/${id}`, {
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
		const token = Cookies.get("token");

		if (!token) {
			return {success: false, message: "Unauthorized"};
		}

		const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/blog/${postId}/like`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			return {success: false, message: "Failed to like post."};
		}

		return {success: true};
	} catch (error) {
		return {success: false, message: "Failed to toggle like post."};
	}
}