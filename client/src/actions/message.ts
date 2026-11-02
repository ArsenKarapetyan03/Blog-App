"use client"

import { useCallback, useEffect, useRef, useState } from "react";
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

export const sendMessage = async (
	partnerId: number,
	token: string,
	messageText: string
) => {
	const response = await fetch(`${BASE_URL}/message`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ partnerId, messageText }),
	});

	if (!response.ok) {
		throw new Error("Failed to send message");
	}
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

export const updateMessage = async (
	messageId: number,
	messageText: string,
	token: string
) => {
	const response = await fetch(`${BASE_URL}/message`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ messageId, messageText }),
	});

	if (!response.ok) {
		throw new Error("Failed to update message");
	}
};

export const deleteMessage = async (messageId: number, token: string) => {
	const response = await fetch(
		`${BASE_URL}/message`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({messageId})
		}
	);

	if (!response.ok) {
		throw new Error("Failed to delete message");
	}
};