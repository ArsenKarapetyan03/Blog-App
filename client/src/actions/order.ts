"use client";

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";

const getAuthHeaders = () => {
	const token = Cookies.get("token");
	return {
		...(token && { Authorization: `Bearer ${token}` }),
		"Content-Type": "application/json",
	};
};

export const getOrders = async (params?: { page?: number;	limit?: number;	query?: string; }) => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.set("page", String(params.page));
		if (params?.limit) searchParams.set("limit", String(params.limit));
		if (params?.query) searchParams.set("query", params.query);

		const qs = searchParams.toString();
		const url = `${BASE_URL}/order${qs ? `?${qs}` : ""}`;

		const response = await fetch(url, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			return {
				success: false,
				message: "Failed to load orders.",
				data: { orders: [], totalPages: 1 },
			};
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.message || "Failed to load orders.");
		}

		return {
			success: true,
			message: "Orders loaded successfully!",
			data: result.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to load orders.",
			data: { orders: [], totalPages: 1 },
		};
	}
};

export const markOrderAsShipped = async (orderId: number) => {
	try {
		const response = await fetch(`${BASE_URL}/order/${orderId}/ship`, {
			method: "PATCH",
			headers: getAuthHeaders(),
		});

		const result = await response.json();

		if (!response.ok || !result.success) {
			return {
				success: false,
				message: result.message || "Failed to mark order as shipped.",
			};
		}

		return {
			success: true,
			message: result.message || "Order marked as shipped!",
			data: result.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to mark order as shipped.",
		};
	}
};

export const refundOrder = async (orderId: number) => {
	try {
		const response = await fetch(`${BASE_URL}/order/${orderId}/refund`, {
			method: "POST",
			headers: getAuthHeaders(),
		});

		const result = await response.json();

		if (!response.ok || !result.success) {
			return {
				success: false,
				message: result.message || "Failed to refund order.",
			};
		}

		return {
			success: true,
			message: result.message || "Order refunded successfully!",
			data: result.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to refund order.",
		};
	}
};