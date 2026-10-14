"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { BASE_URL } from "@/config/api";

export interface ActionState {
	success: boolean;
	error: string | null;
}

export const createCommentAction = async (
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> => {
	const content = String(formData.get("content"));
	const postId = Number(formData.get("postId"));
	const rawReplyId = formData.get("replyId");
	const replyId = rawReplyId ? Number(rawReplyId) : null;

	if (!content || !content.trim()) {
		return {success: false, error: "Comment content cannot be empty."};
	}

	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		const response = await fetch(`${BASE_URL}/comment`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({
				content,
				postId: Number(postId),
				replyId: replyId ? Number(replyId) : null
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {success: false, error: errorData.error || "Failed to post comment."};
		}

		revalidatePath(`/posts/${postId}`);

		return { success: true, error: null };
	} catch (error) {
		console.error("Server Action Error:", error);
		return { success: false, error: "Internal server error." };
	}
}
