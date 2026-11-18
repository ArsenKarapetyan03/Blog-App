"use client";

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";

const token = Cookies.get("token");

interface CreateProductPayload {
	name: string;
	description?: string;
	priceInDollars: string;
	currency: string;
}

export const getProducts = async () => {
	try {
		const token = Cookies.get("token");

		const response = await fetch(`${BASE_URL}/product`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to load products.",
				data: [],
			};
		}

		const result = await response.json();
		const products = Array.isArray(result) ? result : result.data || [];

		return {
			success: true,
			message: "Products loaded successfully!",
			data: products,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to load products.",
			data: [],
		};
	}
};

export const createProduct = async (
	{
		name,
		description,
		priceInDollars,
		currency,
	}: CreateProductPayload
) => {
	try {
		const dollarValue = parseFloat(priceInDollars);
		if (!name.trim() || isNaN(dollarValue) || dollarValue <= 0) {
			return {
				success: false,
				message: "Please enter a valid product name and positive price.",
			};
		}

		const unitAmount = Math.round(dollarValue * 100);

		const response = await fetch(`${BASE_URL}/product`, {
			method: "POST",
			headers: {
				...(token && {Authorization: `Bearer ${token}`}),
				"Content-Type": "application/json",

			},
			body: JSON.stringify({
				name: name.trim(),
				description: description?.trim() || undefined,
				unitAmount,
				currency,
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to create product.",
			};
		}

		return {success: true, message: "Product created successfully!"};
	} catch (error) {
		return {success: false, message: "Failed to create product."};
	}
};

export const createCheckoutSession = async (
	priceId: number | string,
	quantity: number = 1
) => {
	try {
		if (!priceId) {
			return { success: false, message: "Invalid price ID." };
		}

		const response = await fetch(`${BASE_URL}/product/checkout/`, {
			method: "POST",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				priceId,
				quantity,
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to start checkout session.",
			};
		}

		const data = await response.json();

		if (!data.url) {
			return { success: false, message: "Checkout URL was not returned." };
		}

		return {
			success: true,
			message: "Checkout session created!",
			url: data.url,
		};
	} catch (error) {
		return { success: false, message: "Failed to start checkout session." };
	}
};

export interface UserProduct {
	id: string;
	name: string;
	description?: string | null;
	price?: number;
	currency?: string;
	status?: "active" | "canceled" | "past_due" | "paid" | string;
	imageUrl?: string | null;
	purchasedAt?: string;
}

interface ApiResponse {
	success: boolean;
	data: UserProduct[];
	message?: string;
}

export const getUserProducts = async (): Promise<UserProduct[]> => {
	const response = await fetch(`${BASE_URL}/product/my`, {
		method: "GET",
		headers: {
			...(token && { Authorization: `Bearer ${token}` }),
			"Content-Type": "application/json",
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to load products (${response.status})`);
	}

	const result: ApiResponse = await response.json();

	if (!result.success) {
		throw new Error(result.message || "Unable to fetch products");
	}

	return result.data || [];
};