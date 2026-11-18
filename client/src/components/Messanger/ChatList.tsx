"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { MessageSquare, RotateCw, UserPlus } from "lucide-react";
import Cookies from "js-cookie";
import { notification } from "antd";
import { UserType, ChatType } from "@/types/types";
import { getFriends } from "@/actions/friend";
import { getChats } from "@/actions/chat";
import { useAuth } from "@/context/useAuth";
import { useWebSocket } from "@/context/webSocketContext";
import { useMessage } from "@/context/MessageContext";
import { MessageWindow } from "./MessageWindow";
import { Chats } from "./Chats";
import { SelectUsers } from "@/components/Messanger/SelectUsers";

export const ChatList = () => {
	const token = Cookies.get("token");

	const { user } = useAuth();
	const { chats, setChats, activeChatId, setActiveChatId } = useWebSocket();
	const { setIsAddUserModalOpen } = useMessage();

	const [friendsList, setFriendsList] = useState<UserType[]>([]);
	const [isPending, startTransition] = useTransition();
	const [api, contextHolder] = notification.useNotification();

	const showErrorNotification = useCallback(
		(description: string) => {
			api.error({
				title: "Error",
				description,
				placement: "topRight",
			});
		},
		[api]
	);

	const fetchChats = useCallback(() => {
		if (!token) {
			showErrorNotification("Authentication token is missing");
			return;
		}

		startTransition(async () => {
			try {
				const chatsData = await getChats(token);
				setChats(chatsData);

				const selectedChatId = sessionStorage.getItem("selectedChatId");
				if (selectedChatId) {
					setActiveChatId(JSON.parse(selectedChatId));
				}
			} catch (err) {
				showErrorNotification(
					err instanceof Error ? err.message : "Something went wrong"
				);
				setChats([]);
			}
		});
	}, [token, setChats, setActiveChatId, showErrorNotification]);

	const fetchFriends = useCallback(async () => {
		if (!user || !token) {
			return;
		}

		try {
			const result = await getFriends(token);
			if (Array.isArray(result)) {
				setFriendsList(result);
			}
		} catch (err) {
			console.error("Failed to fetch friends:", err);
			showErrorNotification("Failed to load friends list.");
		}
	}, [user, token, showErrorNotification]);

	useEffect(() => {
		fetchFriends();
		fetchChats();
	}, [fetchFriends, fetchChats]);

	const activeChat = chats.find((c) => c.id === activeChatId);

	const handleSelectChat = (chatId: number) => {
		setActiveChatId(chatId);
		sessionStorage.setItem("selectedChatId", JSON.stringify(chatId));
	};

	const handleStartChatWithFriend = (friend: UserType) => {
		if (!user) {
			return;
		}
		const tempChatId = -friend.id;

		if (chats.some((c) => c.id === tempChatId)) {
			handleSelectChat(tempChatId);
			return;
		}

		const tempChat: ChatType = {
			id: tempChatId,
			title: friend.name,
			isGroup: false,
			users: [user, friend],
			adminId: user.id,
			lastMessage: null as any,
			unreadCount: 0,
			updatedAt: new Date().toISOString(),
		};

		setChats((prev) => [tempChat, ...prev]);
		handleSelectChat(tempChatId);
	};

	if (!user) {
		return "Authentication required";
	}

	if (isPending && chats.length === 0) {
		return (
			<>
				{contextHolder}
				<div className="flex h-150 w-full items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
						<p className="text-sm font-medium text-gray-500">
							Loading your conversations...
						</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<div className="relative flex h-180 w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
			{contextHolder}

			<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-gray-900">Messages</h2>
					<p className="text-xs text-gray-500">{chats.length} active conversations</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsAddUserModalOpen(true)}
						className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						<UserPlus size={18} />
						New Chat / Group
					</button>
					<button
						onClick={fetchChats}
						disabled={isPending}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
					>
						<RotateCw size={18} className={isPending ? "animate-spin" : ""} />
						{isPending ? "Refreshing..." : "Refresh"}
					</button>
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				<div className="w-full overflow-y-auto border-r border-gray-100 md:w-80">
					<Chats
						chats={chats}
						activeChatId={activeChatId}
						friends={friendsList}
						currentUserId={user.id}
						onSelectChat={handleSelectChat}
						onStartChatWithFriend={handleStartChatWithFriend}
					/>
				</div>

				<div className="hidden flex-1 flex-col bg-slate-50/60 md:flex">
					{activeChat && token && activeChatId ? (
						<MessageWindow
							chat={activeChat}
							currentUserId={user.id}
							token={token}
						/>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100/80 text-blue-500">
								<MessageSquare size={32} />
							</div>
							<h3 className="font-semibold text-gray-900">No chat selected</h3>
						</div>
					)}
				</div>
			</div>

			{token && <SelectUsers token={token} />}
		</div>
	);
};