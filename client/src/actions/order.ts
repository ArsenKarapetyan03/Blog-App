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

export const getOrders = async () => {
	try {
		const response = await fetch(`${BASE_URL}/order`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			return {
				success: false,
				message: "Failed to load orders.",
				data: [],
			};
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.message || "Failed to load orders.");
		}

		const orders = Array.isArray(result) ? result : result.data || [];

		return {
			success: true,
			message: "Orders loaded successfully!",
			data: orders,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to load orders.",
			data: [],
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