"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/actions/auth";

export const LogoutButton = () => {
	const router = useRouter();

	const handleLogout = async () => {
		await logout();

		const res = await fetch("/api/auth/logout", { method: "POST" });

		if (res.ok) {
			router.refresh();
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="bg-black text-white p-2 rounded-lg cursor-pointer transition
			 hover:text-indigo-200 hover:bg-gray-800 active:scale-98"
		>
			Log out
		</button>
	);
};
