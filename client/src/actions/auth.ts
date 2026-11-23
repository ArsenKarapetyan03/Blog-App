import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";

export type ActionResponse = {
	success: boolean;
	message: string;
	fields?: Record<string, string>;
};

export const signUp = async (
	prevState: ActionResponse,
	formData: FormData
): Promise<ActionResponse> => {
	const plainFormData = Object.fromEntries(formData) as Record<string, string>;
	const safeFields = {
		name: plainFormData.name,
		email: plainFormData.email,
	};

	try {
		const response = await fetch(`${BASE_URL}/auth/sign-up`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(plainFormData),
		});

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			return {
				success: false,
				message: data?.message || "Registration failed.",
				fields: safeFields,
			};
		}

		return {
			success: true,
			message: "Signed up successfully.",
		};
	} catch (error) {
		console.error("Registration Error:", error);
		return {
			success: false,
			message: "Server error. Please try again later.",
			fields: safeFields,
		};
	}
};

export const signIn = async (
	prevState: ActionResponse,
	formData: FormData
): Promise<ActionResponse> => {
	const plainFormData = Object.fromEntries(formData) as Record<string, string>;

	try {
		const response = await fetch(`${BASE_URL}/auth/sign-in`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(plainFormData),
		});

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			return {
				success: false,
				message: data?.message || "Invalid credentials.",
				fields: { email: plainFormData.email },
			};
		}

		if (!data?.token) {
			return {
				success: false,
				message: "Authentication token was not provided.",
				fields: { email: plainFormData.email },
			};
		}

		Cookies.set("token", data.token, {
			sameSite: "lax",
			path: "/",
			expires: 3,
			secure: process.env.NODE_ENV === "production"
		});

		return {
			success: true,
			message: "Signed in successfully.",
		};
	} catch (error) {
		console.error("Login Error:", error);
		return {
			success: false,
			message: "Server error. Please try again later.",
			fields: { email: plainFormData.email },
		};
	}
};

export const logout = () => {
	Cookies.remove("token", { path: "/" });
	sessionStorage.clear();
	window.location.href = "/sign-in";
};