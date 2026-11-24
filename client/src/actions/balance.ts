"use client";

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";

export interface BalanceItem {
	availableAmount: number;
	pendingAmount: number;
	currency: string;
}

export const getBalance = async (): Promise<{
	success: boolean;
	message: string;
	data: BalanceItem[];
}> => {
	const token = Cookies.get("token");

	const response = await fetch(`${BASE_URL}/balance`, {
		method: "GET",
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		return {
			success: false,
			message: "Failed to load balance.",
			data: [],
		};
	}

	const result = await response.json();

	if (!result.success) {
		return {
			success: false,
			message: result.message || "Failed to load balance.",
			data: [],
		};
	}

	const balances = Array.isArray(result) ? result : result.data || [];

	return {
		success: true,
		message: result.message || "Balance loaded successfully!",
		data: balances,
	};
};