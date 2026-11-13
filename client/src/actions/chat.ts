"use client";

import { ChatType } from "@/types/types";
import { BASE_URL } from "@/config/api";

interface ChatPayload {
	participantIds: number[];
	isGroup: boolean;
	title: string | null;
}

export const createChat = async (payload: ChatPayload, token: string) => {
	if (!token || payload.participantIds.length === 0) {
		return {success: false, message: "Unauthorized"};
	}

	const response = await fetch(`${BASE_URL}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const data = await response.json();
		return {success: false, message: data?.message || "Failed to create conversation"};
	}

	const result = await response.json();
	if (result.success && result.data) {
		return {success: true, data: result.data as ChatType};
	}

	return {success: false, message: "Failed to create conversation"};
};

export const getChats = async (token: string) => {
	const response = await fetch(`${BASE_URL}/chat`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		const data = await response.json();
		return {success: false, message: data?.message || "Failed to fetch messages."};
	}

	const result = await response.json();

	if (!result.success) {
		return {success: false, message: "Failed to fetch messages."};
	}

	return result.data || [];
};

export const updateChatTitle = async (title: string, chatId: number, token: string) => {
	const response = await fetch(`${BASE_URL}/chat`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({chatId, title}),
	});

	if (!response.ok) {
		const data = await response.json();
		return {success: false, message: data?.message || "Error"};
	}

	return {success: true, message: "Chat updated successfully."};
}

export const addChatMembers = async (chatId: number, memberIds: number[], token: string) => {
	const response = await fetch(`${BASE_URL}/chat/member`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({chatId, memberIds}),
	});

	if (!response.ok) {
		return {success: false, message: "Failed to add members."};
	}

	return {success: true, message: "Members added successfully."};
};

export const deleteChatMember = async (chatId: number, memberId: number, token: string) => {
	const response = await fetch(`${BASE_URL}/chat/member`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({chatId, memberId}),
	});

	if (!response.ok) {
		return {success: false, message: "Failed to delete the member."};
	}

	return {success: true, message: "Member deleted successfully."};
}