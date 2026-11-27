import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";
import { Subscription } from "@/types/types";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export const getMySubscriptions = async (): Promise<ApiResponse<Subscription[]>> => {
	const token = Cookies.get("token");

	const res = await fetch(`${BASE_URL}/subscription/my`, {
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

export const cancelSubscriptionAtPeriodEnd = async (subscriptionId: number): Promise<ApiResponse<Subscription>> => {
	const token = Cookies.get("token");

	const res = await fetch(`${BASE_URL}/subscription/${subscriptionId}/cancel`, {
		method: "PATCH",
		headers: {...(token && { Authorization: `Bearer ${token}` })},
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || "Failed to cancel subscription");
	}

	return json;
};

export const cancelSubscriptionNow = async (subscriptionId: number): Promise<ApiResponse<Subscription>> => {
	const token = Cookies.get("token");

	const res = await fetch(`${BASE_URL}/subscription/${subscriptionId}/cancel-now`, {
		method: "PATCH",
		headers: {...(token && { Authorization: `Bearer ${token}` })},
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || "Failed to cancel subscription");
	}

	return json;
};