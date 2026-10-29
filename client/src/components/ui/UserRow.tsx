"use client"

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Cookies from "js-cookie";
import { UserType } from "@/types/types";
import { cn } from "@/lib/cn";
import { InfoRow } from "@/components/ui/InfoRow";
import { BASE_URL } from "@/config/api";

interface UserRowProps {
	user: UserType;
	relationshipStatus: "none" | "incoming" | "outgoing" | "accepted";
}

type FriendAction = "add" | "accept" | "remove";

export const UserRow = (
	{
		user,
		relationshipStatus,
	}: UserRowProps
) => {
	const router = useRouter();
	const token = Cookies.get("token");

	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");

	const toggleFriend = (action: FriendAction) => {
		setError("");

		startTransition(async () => {
			try {
				const path = action === "accept" ? "/friend/accept" : "/friend/";
				const response = await fetch(`${BASE_URL}${path}`, {
					method: action === "remove" ? "DELETE" : "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`
					},
					body: JSON.stringify({friendId: user.id})
				});

				if (!response.ok) {
					throw new Error("Failed to update friend status");
				}

				router.refresh();
			} catch (error) {
				console.error("Error updating friendship", error);
				setError(error instanceof Error ? error.message : "Failed to update friend status");
			}
		});
	}

	const handleClick = () => toggleFriend(
		relationshipStatus === "none"
			? "add"
			: relationshipStatus === "incoming"
				? "accept"
				: "remove",
	);

	return (
		<div
			className="group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-100
			dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-200
			hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
		>
			<div className="flex-1 min-w-0">
				<InfoRow name={user.name} />

				{user.email
					&& <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
						    {user.email}
             </p>
				}
			</div>

			<div className="flex items-center gap-2">
				{relationshipStatus === "incoming" && (
					<button
						type="button"
						onClick={() => toggleFriend("remove")}
						disabled={isPending}
						className="px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
					>
						Decline
					</button>
				)}
				<button
					type="button"
					onClick={handleClick}
					disabled={isPending}
					className={cn(
						"flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50",
						relationshipStatus === "none" || relationshipStatus === "incoming"
							? "bg-indigo-600 text-white hover:bg-indigo-500"
							: "bg-indigo-50 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900",
					)}
				>
					{relationshipStatus === "none"
						? "Add friend"
						: relationshipStatus === "incoming"
							? "Accept request"
							: relationshipStatus === "outgoing"
								? "Cancel request"
								: "Remove friend"
					}
				</button>
			</div>
			{error && <p role="alert" className="absolute left-4 -bottom-5 text-xs text-red-600">
				{error}
      </p>
			}
		</div>
	)
}