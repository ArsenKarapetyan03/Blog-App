"use client"

import Cookies from "js-cookie";
import { BASE_URL } from "@/config/api";

type ActionResponse = {success: boolean; message: string};

export const signUp = async (prevState: any, formData: FormData): Promise<ActionResponse | void> => {
	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/sign-up`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(plainFormData)
		});

		if (!response.ok) {
			const data = await response.json();
			return { success: false, message: data?.message || "Registration failed." };
		}

		return {success: true, message: "Signed up successfully."};
	} catch (error) {
		console.error("Registration Error:", error);
		return { success: false, message: "Server error. Please try again later." };
	}
}

export const signIn = async (prevState: any, formData: FormData): Promise<ActionResponse | void> => {
	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/sign-in`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(plainFormData)
		});

		if (!response.ok) {
			const data = await response.json();
			return {success: false, message: data?.message || "Invalid credentials."};
		}

		const data = await response.json();

		Cookies.set("token", data.token, {
			sameSite: "strict",
			path: "/",
			expires: 7,
			secure: process.env.NODE_ENV === "production"
		});

		return {success: true, message: "Signed in successfully."};
	} catch (error) {
		console.error("Login Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}

export const logout = async () => {
	Cookies.remove("token");
	Cookies.remove("user");

	window.location.href = "/sign-in";
}