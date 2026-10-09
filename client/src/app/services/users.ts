"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BASE_URL } from "@/config/api";

export const register = async (formData: FormData) => {
	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/register`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(plainFormData)
		});

		if (!response.ok) {
			const message = (await response.json()).message;
			return {success: false, message};
		}
	} catch (error) {
		console.error("Registration Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
	redirect('/login');
}

export const login = async (formData: FormData) => {
	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/login`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(plainFormData)
		});

		if (!response.ok) {
			const message = (await response.json()).message;

			return {success: false, message};
		}

		const data = await response.json();

		const cookieStore = await cookies();

		cookieStore.set("token", data.token, {
			httpOnly: true,
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
	} catch (error) {
		console.error("Login Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}

	redirect('/');
}