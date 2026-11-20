"use client";

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";
import { Product } from "@/types/types";

const token = Cookies.get("token");

interface CreateProductPayload {
	name: string;
	description?: string;
	priceInDollars: string;
	currency: string;
}

interface CheckoutItemPayload {
	priceId: number | string;
	quantity?: number;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "description">> & {
	description?: string | null;
};

export const getProducts = async () => {
	try {
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

export const getProductById = async (productId: number | string) => {
	try {
		if (!productId) {
			return {
				success: false,
				message: "Invalid product ID.",
			};
		}

		const response = await fetch(`${BASE_URL}/product/${productId}`, {
			method: "GET",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to fetch product.",
			};
		}

		const data = await response.json().catch(() => ({}));

		return {
			success: true,
			data: data.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to fetch product.",
		};
	}
};

export const getUserProducts = async (): Promise<Product[]> => {
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

	const result = await response.json();

	if (!result.success) {
		throw new Error(result.message || "Unable to fetch products");
	}

	return result.data || [];
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

export const createCheckoutSession = async (items: CheckoutItemPayload[]) => {
	try {
		if (!Array.isArray(items) || items.length === 0) {
			return { success: false, message: "Your cart is empty." };
		}

		const response = await fetch(`${BASE_URL}/product/checkout/`, {
			method: "POST",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				items,
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

export const archiveProduct = async (productId: number | string) => {
	try {
		if (!productId) {
			return {
				success: false,
				message: "Invalid product ID.",
			};
		}

		const response = await fetch(`${BASE_URL}/product/${productId}/archive`, {
			method: "PATCH",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to archive product.",
			};
		}

		const data = await response.json().catch(() => ({}));

		return {
			success: true,
			message: data.message || "Product archived successfully!",
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to archive product.",
		};
	}
};

export const updateProduct = async (
	productId: number | string,
	payload: UpdateProductPayload
) => {
	try {
		if (!productId) {
			return {
				success: false,
				message: "Invalid product ID.",
			};
		}

		const { priceInDollars, ...rest } = payload;

		const requestBody: Record<string, unknown> = { ...rest };

		if (priceInDollars !== undefined) {
			const parsedPrice = Number(priceInDollars);
			if (isNaN(parsedPrice) || parsedPrice <= 0) {
				return {
					success: false,
					message: "Invalid price amount.",
				};
			}
			requestBody.unitAmount = Math.round(parsedPrice * 100);
		}

		const response = await fetch(`${BASE_URL}/product/${productId}`, {
			method: "PATCH",
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to update product.",
			};
		}

		const data = await response.json().catch(() => ({}));

		return {
			success: true,
			message: data.message || "Product updated successfully!",
			data: data.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to update product.",
		};
	}
};