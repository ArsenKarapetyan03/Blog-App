"use client";

import { BASE_URL } from "@/config/api";

export const getFriends = async (token: string) => {
	const response = await fetch(`${BASE_URL}/friend`, {
		headers: {
			Authorization: `Bearer ${token}`,
		}
	});

	if (!response.ok) {
		return [];
	}

	const data = await response.json();

	if (!data.success) {
		return [];
	}

	return data.friends;
}