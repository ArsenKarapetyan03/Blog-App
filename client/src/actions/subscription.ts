import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";
import { Subscription } from "@/types/types";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export const getSubscriptions = async (): Promise<ApiResponse<Subscription[]>> => {
	const token = Cookies.get("token");

	const res = await fetch(`${BASE_URL}/subscriptions`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || "Failed to fetch subscriptions");
	}

	return json;
};

export const cancelSubscription = async (
	subscriptionId: number
): Promise<ApiResponse<Subscription>> => {
	const token = Cookies.get("token");

	const res = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || "Failed to cancel subscription");
	}

	return json;
};