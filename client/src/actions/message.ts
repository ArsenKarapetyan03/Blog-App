"use client"

import { MessageType } from "@/types/types";
import { BASE_URL } from "@/config/api";

export const getMessages = async (
	partnerId: number,
	token: string,
	offset: number
): Promise<MessageType[]> => {
	const params = new URLSearchParams({
		partnerId: String(partnerId),
		offset: String(offset),
	});

	const response = await fetch(`${BASE_URL}/message?${params}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch messages");
	}

	const data = await response.json();
	return (data.messages || []).reverse();
};

export const markMessagesAsRead = async (partnerId: number, token: string) => {
	const response = await fetch(
		`${BASE_URL}/message/read`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({partnerId})
		}
	);

	if (!response.ok) {
		throw new Error("Failed to mark messages as read");
	}
};