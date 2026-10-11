"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BASE_URL } from "@/config/api";

interface SessionUser {
	id: string | number;
	name: string;
	email: string;
}

export const signUp = async (formData: FormData) => {
	let isSuccessful = false;

	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/sign-up`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(plainFormData)
		});

		if (!response.ok) {
			const message = (await response.json()).message;
			return {success: false, message};
		}

		isSuccessful = true;
	} catch (error) {
		console.error("Registration Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
	if (isSuccessful) {
		redirect("/sign-in");
	}
}

export const signIn = async (formData: FormData) => {
	let isSuccessful = false;

	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${BASE_URL}/auth/sign-in`, {
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

		isSuccessful = true;
	} catch (error) {
		console.error("Login Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}

	if (isSuccessful) {
		redirect("/");
	}
}

export const logout = async () => {

	const cookieStore = await cookies();
	cookieStore.delete("token");
	cookieStore.delete("user");

	redirect("/sign-in");
}

export async function getSessionUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		return null;
	}

	try {
		const response = await fetch(`${BASE_URL}/auth/me`, {
			headers: {Cookie: `token=${token}`},
		});

		if (!response.ok) {
			return null;
		}

		const data: {user?: SessionUser} = await response.json();

		return data.user ?? null;
	} catch {
		return null;
	}
}