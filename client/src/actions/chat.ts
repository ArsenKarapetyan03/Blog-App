"use client";

import { ChatType } from "@/types/types";
import { BASE_URL } from "@/config/api";

interface ChatPayload {
	participantIds: number[];
	isGroup: boolean;
	title: string | null;
}

export const createChat = async (payload: ChatPayload, token: string): Promise<ChatType | null> => {
	if (!token || payload.participantIds.length === 0) {
		return null;
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
		throw new Error("Failed to create conversation");
	}

	const result = await response.json();
	if (result.success && result.data) {
		return result.data as ChatType;
	}

	return null;
};

export const fetchChatsApi = async (token: string): Promise<ChatType[]> => {
	const response = await fetch(`${BASE_URL}/chat`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch messages.");
	}

	const result = await response.json();

	if (!result.success) {
		throw new Error("Failed to fetch messages.");
	}

	return result.data || [];
};