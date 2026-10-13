"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BASE_URL } from "@/config/api";

interface SessionUser {
	id: string | number;
	name: string;
	email: string;
}

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

	} catch (error) {
		console.error("Registration Error:", error);
		return { success: false, message: "Server error. Please try again later." };
	}

	redirect("/sign-in");
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
		const cookieStore = await cookies();
		console.log(data.token)
		cookieStore.set("token", data.token, {
			httpOnly: true,
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
			secure: process.env.NODE_ENV === "production"
		});

	} catch (error) {
		console.error("Login Error:", error);
		return { success: false, message: "Server error. Please try again later." };
	}

	redirect("/");
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
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			cache: "no-store"
		});

		if (!response.ok) {
			return null;
		}

		const data: {user?: SessionUser} = await response.json();

		return data.user ?? null;
	} catch (error) {
		console.error("Fetch session user error:", error);
		return null;
	}
}