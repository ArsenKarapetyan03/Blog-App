"use client";

import { BASE_URL } from "@/config/api";
import { UserType } from "@/types/types";

interface FetchAllUsersParams {
	query: string;
	page: number;
	token: string;
}

interface FetchAllUsersResponse {
	users: UserType[];
	totalPages: number;
}

export const fetchAllUsersApi = async (
	{
		query,
		page,
		token,
	}: FetchAllUsersParams
): Promise<FetchAllUsersResponse> => {
	const params = new URLSearchParams({page: String(page)});
	if (query) {
		params.set("query", query);
	}

	const response = await fetch(`${BASE_URL}/user?${params.toString()}`, {
		headers: {Authorization: `Bearer ${token}`},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}

	const result = await response.json();

	return {
		users: result.data?.users || [],
		totalPages: result.data?.totalPages || 1,
	};
};
