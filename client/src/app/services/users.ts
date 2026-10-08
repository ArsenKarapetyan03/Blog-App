import { DATA_URL } from "@/config/api";

export const createUser = async (formData: FormData) => {
	try {
		const plainFormData = Object.fromEntries(formData);

		const response = await fetch(`${DATA_URL}/auth`, {
			method: "POST",
			body: JSON.stringify(plainFormData),
			headers: {"Content-Type": "application/json"},
		});

		if (!response.ok) {
			return {success: false, message: "Failed to register."};
		}

		return {success: true, message: "User registered successfully!"};
	} catch (error) {
		console.error("Registration Error:", error);
		return {success: false, message: "Server error. Please try again later."};
	}
}