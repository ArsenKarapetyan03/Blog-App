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

		return {success: true, message: "User registered successfully!"};
	} catch (error) {
		console.error("Registration Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
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

		localStorage.setItem("token", data.token);

		return {success: true, message: "User login successfully!"};
	} catch (error) {
		console.error("Login Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}