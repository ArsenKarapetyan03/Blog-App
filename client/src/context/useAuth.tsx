"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface UserPayload {
	id: number;
	name: string;
	email: string;
	exp: number;
}

interface AuthContextType {
	user: UserPayload | null;
	isLoading: boolean;
	refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	refreshUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<UserPayload | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshUser = () => {
		const token = Cookies.get("token");
		if (!token) {
			setUser(null);
			setIsLoading(false);
			return;
		}

		try {
			const decoded = jwtDecode<UserPayload>(token);

			if (decoded.exp * 1000 < Date.now()) {
				Cookies.remove("token", { path: "/" });
				setUser(null);
			} else {
				setUser(decoded);
			}
		} catch (error) {
			console.error("Failed to decode auth token:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		refreshUser();
	}, []);

	return (
		<AuthContext.Provider value={{ user, isLoading, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
