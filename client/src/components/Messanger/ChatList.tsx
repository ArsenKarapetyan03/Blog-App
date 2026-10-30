"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Cookies from "js-cookie";
import { MessageSquare, RotateCw, TriangleAlert } from "lucide-react";
import { BASE_URL } from "@/config/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { Chats } from "./Chats";
import { UserWithLastMessage } from "@/types/types";
import { MessageWindow } from "./MessageWindow";

const fetchMessages = async (partnerId: number, token: string) => {
	const response = await fetch(`${BASE_URL}/message/${partnerId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		throw new Error("Failed to fetch messages for this chat");
	}
	const result = await response.json();
	return result.data || [];
};

export const ChatList = () => {
	const token = Cookies.get("token");

	const [chats, setChats] = useState<UserWithLastMessage[]>([]);
	const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [isPending, startTransition] = useTransition();

	const fetchChats = () => {
		if (!token) {
			setError("Authentication token is missing");
			return;
		}

		startTransition(async () => {
			try {
				setError(null);
				const response = await fetch(`${BASE_URL}/message/chats`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!response.ok) {
					setError("Failed to fetch messages. Please try again.");
					return;
				}

				const result = await response.json();

				if (!result.success) {
					setChats([]);
					return;
				}

				setChats(result.data || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong");
			}
		});
	};

	useEffect(() => {
		fetchChats();
	}, []);

	const activeChat = chats.find((c) => c.chatPartner.id === activePartnerId);

	if (isPending && chats.length === 0) {
		return (
			<div className="flex h-150 w-full items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" role="status" />
					<p className="text-sm font-medium text-gray-500">Loading your conversations...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-150 w-full items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
				<div className="max-w-sm text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
						<TriangleAlert />
					</div>
					<h3 className="mb-1 text-sm font-semibold text-gray-900">Failed to load chats</h3>
					<p className="mb-4 text-xs text-gray-500">{error}</p>
					<button
						onClick={fetchChats}
						className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-180 w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
			<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-gray-900">Messages</h2>
					<p className="text-xs text-gray-500">{chats.length} active conversations</p>
				</div>
				<button
					onClick={fetchChats}
					disabled={isPending}
					className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
				>
					<RotateCw size="18" />
					{isPending ? "Refreshing..." : "Refresh"}
				</button>
			</div>

			{chats.length === 0 ? (
				<div className="flex flex-1 items-center justify-center p-8 bg-gray-50/50">
					<EmptyState message="No messages yet" />
				</div>
			) : (
				<div className="flex flex-1 overflow-hidden">
					<div className="w-full md:w-80 border-r border-gray-100 overflow-y-auto">
						<Chats
							chats={chats}
							activePartnerId={activePartnerId}
							onSelectChat={setActivePartnerId}
						/>
					</div>

					<div className="hidden md:flex flex-1 flex-col bg-slate-50/60">
						{activeChat && token ? (
							/* key={activePartnerId} перезапускает Suspense именно для
							   этой области экрана при каждом переключении собеседника */
							<Suspense
								key={activePartnerId}
								fallback={
									<div className="flex flex-1 flex-col items-center justify-center gap-2">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
										<span className="text-xs text-gray-400">Loading messages...</span>
									</div>
								}
							>
								<MessageWindow
									partner={activeChat.chatPartner}
									token={token}
									messagesPromise={fetchMessages(activePartnerId, token)}
									onMessageSent={fetchChats}
								/>
							</Suspense>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100/80 text-blue-500">
									<MessageSquare size={32} strokeWidth={2} />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">No chat selected</h3>
									<p className="mt-1 text-sm text-gray-400 max-w-60">
										Choose a contact from the list on the left to start a real-time conversation.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatList;
