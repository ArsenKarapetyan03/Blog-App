"use client";

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";
import { Product } from "@/types/types";

interface RecurringPricesDollars {
	day: string;
	week: string;
	month: string;
	year: string;
}

interface CreateProductPayload {
	name: string;
	description?: string;
	priceInDollars: string;
	currency: string;
	allowRecurring: boolean;
	recurringPrices?: RecurringPricesDollars;
}

interface CheckoutItemPayload {
	priceId: number | string;
	quantity?: number;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "description">> & {
	productId: number | string,
	description?: string | null;
};

const getAuthHeaders = (): HeadersInit => {
	const token = Cookies.get("token");
	return {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
	};
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
			headers: getAuthHeaders(),
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
			data: data.data ?? data,
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
		headers: getAuthHeaders(),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.message || `Failed to load products (${response.status})`);
	}

	const result = await response.json();

	if (!result.success) {
		throw new Error(result.message || "Unable to fetch products");
	}

	return result.data || [];
};

export const createProduct = async (payload: CreateProductPayload) => {
	try {
		const {
			name,
			description,
			priceInDollars,
			currency,
			allowRecurring,
			recurringPrices,
		} = payload;
		const dollarValue = parseFloat(priceInDollars);
		if (!name.trim() || isNaN(dollarValue) || dollarValue <= 0) {
			return {
				success: false,
				message: "Please enter a valid product name and positive price.",
			};
		}

		const unitAmount = Math.round(dollarValue * 100);
		let recurringAmounts:
			| { day: number; week: number; month: number; year: number }
			| undefined;

		if (allowRecurring && recurringPrices) {
			const dayVal = parseFloat(recurringPrices.day || priceInDollars);
			const weekVal = parseFloat(recurringPrices.week || priceInDollars);
			const monthVal = parseFloat(recurringPrices.month || priceInDollars);
			const yearVal = parseFloat(recurringPrices.year || priceInDollars);

			if (
				isNaN(dayVal) ||
				dayVal <= 0 ||
				isNaN(weekVal) ||
				weekVal <= 0 ||
				isNaN(monthVal) ||
				monthVal <= 0 ||
				isNaN(yearVal) ||
				yearVal <= 0
			) {
				return {
					success: false,
					message: "All subscription interval prices must be positive numbers.",
				};
			}

			recurringAmounts = {
				day: Math.round(dayVal * 100),
				week: Math.round(weekVal * 100),
				month: Math.round(monthVal * 100),
				year: Math.round(yearVal * 100),
			};
		}

		const response = await fetch(`${BASE_URL}/product`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({
				name: name.trim(),
				description: description?.trim() || undefined,
				unitAmount,
				currency,
				allowRecurring: Boolean(allowRecurring),
				...(recurringAmounts && { recurringAmounts }),
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errData.message || "Failed to create product.",
			};
		}

		const data = await response.json().catch(() => ({}));

		return {
			success: true,
			message: data.message || "Product created successfully!",
			data: data.data,
		};
	} catch (error) {
		return {
			success: false,
			message: "Failed to create product.",
		};
	}
};

export const updateProduct = async (payload: UpdateProductPayload) => {
	try {
		const { productId, priceInDollars, recurringPrices, name, description, ...rest } =	payload;

		if (!productId) {
			return {
				success: false,
				message: "Invalid product ID.",
			};
		}

		const requestBody: Record<string, unknown> = { ...rest };

		if (name !== undefined) {
			if (!name.trim()) {
				return {
					success: false,
					message: "Product name cannot be empty.",
				};
			}
			requestBody.name = name.trim();
		}

		if (description !== undefined) {
			requestBody.description =
				description === null ? null : description.trim();
		}

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

		if (recurringPrices !== undefined) {
			const recurringAmounts: Record<string, number> = {};

			for (const interval of ["day", "week", "month", "year"] as const) {
				const rawVal = recurringPrices[interval];
				if (rawVal !== undefined && rawVal.trim() !== "") {
					const parsed = Number(rawVal);
					if (isNaN(parsed) || parsed <= 0) {
						return {
							success: false,
							message: `Invalid ${interval} subscription price.`,
						};
					}
					recurringAmounts[interval] = Math.round(parsed * 100);
				}
			}

			requestBody.recurringAmounts = recurringAmounts;
		}

		const response = await fetch(`${BASE_URL}/product/${productId}`, {
			method: "PATCH",
			headers: getAuthHeaders(),
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

export const createCheckoutSession = async (items: CheckoutItemPayload[]) => {
	try {
		if (!Array.isArray(items) || items.length === 0) {
			return { success: false, message: "Your cart is empty." };
		}

		const response = await fetch(`${BASE_URL}/product/checkout`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({ items }),
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
			headers: getAuthHeaders(),
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

export const cancelOrder = async (orderId: string | number) => {
	try {
		if (!orderId) {
			return {
				success: false,
				message: "Invalid order ID.",
			};
		}

		const response = await fetch(`${BASE_URL}/product/cancel`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({ orderId }),
		});

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			return {
				success: false,
				message: data?.message || "Failed to cancel order.",
			};
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		console.error("Error canceling order:", error);
		return {
			success: false,
			message: "Network error while canceling order.",
		};
	}
};