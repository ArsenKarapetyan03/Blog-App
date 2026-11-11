"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Cookies from "js-cookie";
import { Check, MessageSquare, RotateCw, UserPlus, X } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { UserType, ChatType } from "@/types/types";
import { getFriends } from "@/actions/friend";
import { createChat, fetchChatsApi } from "@/actions/chat";
import { fetchAllUsersApi } from "@/actions/user";
import { useWebSocket } from "@/context/webSocketContext";
import { useAuth } from "@/context/useAuth";
import { MessageWindow } from "./MessageWindow";
import { Chats } from "./Chats";
import { Search } from "@/components/Search";
import Pagination from "@/components/Pagination";

export const ChatList = () => {
	const token = Cookies.get("token");
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();

	const currentQuery = searchParams.get("query") || "";
	const currentPage = parseInt(searchParams.get("page") || "1", 10);

	const { chats, setChats, activeChatId, setActiveChatId } = useWebSocket();
	const { user } = useAuth();
	const [allUsers, setAllUsers] = useState<UserType[]>([]);
	const [friendsList, setFriendsList] = useState<UserType[]>([]);
	const [totalUsersPages, setTotalUsersPages] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isUsersLoading, setIsUsersLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreatingChat, setIsCreatingChat] = useState(false);
	const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
	const [groupName, setGroupName] = useState("");

	const fetchChats = useCallback(() => {
		if (!token) {
			setError("Authentication token is missing");
			return;
		}

		startTransition(async () => {
			try {
				setError(null);
				const chatsData = await fetchChatsApi(token);

				setChats(chatsData);

				const selectedChatId = sessionStorage.getItem("selectedChatId");
				if (selectedChatId) {
					setActiveChatId(JSON.parse(selectedChatId));
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong");
				setChats([]);
			}
		});
	}, [token, setChats, setActiveChatId]);

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
		}
	}, [user, token]);

	useEffect(() => {
		fetchFriends();
	}, [fetchFriends]);

	const fetchAllUsers = useCallback(async (query: string, page: number) => {
		if (!token || !isModalOpen) {
			return;
		}
		setIsUsersLoading(true);
		try {
			const { users, totalPages } = await fetchAllUsersApi({ query, page, token });

			setAllUsers(users);
			setTotalUsersPages(totalPages);
		} catch (err) {
			console.error("Failed to fetch users:", err);
		} finally {
			setIsUsersLoading(false);
		}
	}, [token, isModalOpen]);

	useEffect(() => {
		fetchChats();
	}, [fetchChats]);

	useEffect(() => {
		fetchAllUsers(currentQuery, currentPage);
	}, [currentQuery, currentPage, fetchAllUsers]);

	const activeChat = chats.find((c) => c.id === activeChatId);

	const handleCloseModal = () => {
		setIsModalOpen(false);
		const params = new URLSearchParams(searchParams.toString());
		params.delete("query");
		params.delete("page");
		replace(`${pathname}?${params.toString()}`, { scroll: false });
		setSelectedUserIds([]);
		setGroupName("");
	};

	const toggleUserSelection = (userId: number) => {
		setSelectedUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	const handleCreateChatSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!token || isCreatingChat || selectedUserIds.length === 0) {
			return;
		}

		const isGroup = selectedUserIds.length > 1;
		const title = isGroup ? groupName.trim() : null;

		setIsCreatingChat(true);
		setError(null);

		try {
			const newChat = await createChat(
				{ participantIds: selectedUserIds, isGroup, title },
				token
			);

			if (newChat) {
				setChats((prev) => {
					const filtered = prev.filter(
						(c) => !selectedUserIds.includes(Math.abs(c.id)) || c.id > 0
					);
					if (filtered.some((c) => c.id === newChat.id)) return filtered;
					return [newChat, ...filtered];
				});

				handleSelectChat(newChat.id);
				handleCloseModal();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create chat room");
		} finally {
			setIsCreatingChat(false);
		}
	};

	const handleStartChatWithFriend = (friend: UserType) => {
		const tempChatId = -friend.id;

		if (chats.some(c => c.id === tempChatId)) {
			handleSelectChat(tempChatId);
			return;
		}

		const tempChat: ChatType = {
			id: tempChatId,
			title: friend.name,
			isGroup: false,
			users: [user!, friend],
			lastMessage: null as any,
			unreadCount: 0,
			updatedAt: new Date().toISOString()
		};

		setChats((prev) => [tempChat, ...prev]);
		handleSelectChat(tempChatId);
	};

	const handleSelectChat = (chatId: number) => {
		setActiveChatId(chatId);
		sessionStorage.setItem("selectedChatId", JSON.stringify(chatId));
	};

	if (!user) {
		return "Authentication required";
	}

	if (isPending && chats.length === 0) {
		return (
			<div className="flex h-150 w-full items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
					<p className="text-sm font-medium text-gray-500">Loading your conversations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-180 w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md relative">
			<div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-gray-900">Messages</h2>
					<p className="text-xs text-gray-500">{chats.length} active conversations</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsModalOpen(true)}
						className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						<UserPlus size="18" />
						New Chat / Group
					</button>
					<button
						onClick={fetchChats}
						disabled={isPending}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
					>
						<RotateCw size="18" className={isPending ? "animate-spin" : ""} />
						{isPending ? "Refreshing..." : "Refresh"}
					</button>
				</div>
			</div>

			{error && (
				<p role="alert" className="border-b border-red-100 bg-red-50 px-6 py-2 text-sm text-red-700">
					{error}
				</p>
			)}

			<div className="flex flex-1 overflow-hidden">
				<div className="w-full md:w-80 border-r border-gray-100 overflow-y-auto">
					<Chats
						chats={chats}
						activeChatId={activeChatId}
						friends={friendsList}
						currentUserId={user.id}
						onSelectChat={handleSelectChat}
						onStartChatWithFriend={handleStartChatWithFriend}
					/>
				</div>

				<div className="hidden md:flex flex-1 flex-col bg-slate-50/60">
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

			{isModalOpen && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<form id="create-chat-form" onSubmit={handleCreateChatSubmit} className="hidden" />

					<div className="flex h-140 w-full max-w-md flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between pb-4 border-b border-gray-100">
							<h3 className="text-lg font-bold text-gray-900">
								{selectedUserIds.length > 1 ? "Create Group Chat" : "Start New Conversation"}
							</h3>
							<button
								type="button"
								onClick={handleCloseModal}
								className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"
							>
								<X size={20} />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto py-4 space-y-4">
							{selectedUserIds.length > 1 && (
								<div className="space-y-1.5">
									<label htmlFor="groupName" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
										Group Name
									</label>
									<input
										id="groupName"
										type="text"
										required
										value={groupName}
										onChange={(e) => setGroupName(e.target.value)}
										placeholder="Enter group name..."
										className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
									/>
								</div>
							)}

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Select Users
								</label>
								<Search />
							</div>

							<div className="space-y-1 max-h-60 overflow-y-auto pr-1">
								{isUsersLoading ? (
									<div className="flex py-8 items-center justify-center">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
									</div>
								) : allUsers.length === 0 ? (
									<p className="text-center py-6 text-sm text-gray-500">No users found</p>
								) : (
									allUsers.map((item) => {
										const isSelected = selectedUserIds.includes(item.id);
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => toggleUserSelection(item.id)}
												className={cn(
													"flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-gray-50",
													isSelected && "bg-blue-50/50 hover:bg-blue-50"
												)}
											>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-semibold text-gray-900 truncate">
														{item.name || `User #${item.id}`}
													</p>
													{item.name && (
														<p className="text-xs text-gray-400 truncate">@{item.name}</p>
													)}
												</div>
												<div className={cn(
													"flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
													isSelected
														? "border-blue-600 bg-blue-600 text-white"
														: "border-gray-300 bg-white"
												)}>
													{isSelected && <Check size={14} strokeWidth={3} />}
												</div>
											</button>
										);
									})
								)}
							</div>

							{!isUsersLoading && allUsers.length > 0 && (
								<div className="pt-2 border-t border-gray-50">
									<Pagination totalPages={totalUsersPages} currentPage={currentPage} />
								</div>
							)}
						</div>

						<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
							<button
								type="button"
								onClick={handleCloseModal}
								className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="create-chat-form"
								disabled={isCreatingChat || selectedUserIds.length === 0}
								className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 min-w-28"
							>
								{isCreatingChat ? (
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : selectedUserIds.length > 1 ? (
									"Create Group"
								) : (
									"Start Chat"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};