"use client";

import { useState, useEffect, useTransition } from "react";
import Cookies from "js-cookie";
import { MessageSquare, RotateCw, UserPlus, X } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { BASE_URL } from "@/config/api";
import { UserWithLastMessage, UserType } from "@/types/types";
import { EmptyState } from "@/components/ui/EmptyState";
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

	const [chats, setChats] = useState<UserWithLastMessage[]>([]);
	const [allUsers, setAllUsers] = useState<UserType[]>([]);
	const [totalPages, setTotalPages] = useState(1);
	const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isUsersLoading, setIsUsersLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [refreshTicket, setRefreshTicket] = useState(0);

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
					setError("Failed to fetch messages.");
					return;
				}
				const result = await response.json();
				if (!result.success) {
					setChats([]);
					return;
				}
				setChats(result.data || []);
				setRefreshTicket((prev) => prev + 1);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Something went wrong");
			}
		});
	};

	const fetchAllUsers = async (query: string, page: number) => {
		if (!token || !isModalOpen) {
			return;
		}
		setIsUsersLoading(true);
		try {
			const params = new URLSearchParams({page: String(page)});
			if (query) {
				params.set("query", query);
			}

			const response = await fetch(`${BASE_URL}/user?${params.toString()}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const result = await response.json();

				setAllUsers(result.data.users || result || []);
				setTotalPages(result.data.totalPages || 1);
			}
		} catch (err) {
			console.error("Failed to fetch users:", err);
		} finally {
			setIsUsersLoading(false);
		}
	};

	useEffect(() => {
		fetchChats();
	}, []);

	useEffect(() => {
		fetchAllUsers(currentQuery, currentPage);
	}, [currentQuery, currentPage, isModalOpen]);

	useEffect(() => {
		if (!token || chats.length === 0) {
			return;
		}

		const url = new URL(BASE_URL);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		url.pathname = "";
		url.searchParams.set("token", `Bearer ${token}`);

		const socket = new WebSocket(url.toString());

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (data.type === "MESSAGES_READ") {
					setChats((prevChats) =>
						prevChats.map((chat) => {
							if (chat.chatPartner.id === data.payload.readerId) {
								return {
									...chat,
									lastMessage: {
										...chat.lastMessage,
										isRead: true
									}
								};
							}
							return chat;
						})
					);
				}

				if (data.type === "NEW_MESSAGE") {
					setChats((prevChats) => {
						const msg = data.payload;
						const isFromActivePartner = activePartnerId && (msg.senderId === activePartnerId || msg.receiverId === activePartnerId);
						const targetPartnerId = isFromActivePartner ? activePartnerId : msg.senderId;

						const updatedChats = prevChats.map((chat) => {
							if (chat.chatPartner.id === targetPartnerId) {
								return {
									...chat,
									lastMessage: {
										...msg,
										isRead: targetPartnerId === activePartnerId ? true : msg.isRead
									}
								};
							}
							return chat;
						});

						const targetIndex = updatedChats.findIndex(c => c.chatPartner.id === targetPartnerId);
						if (targetIndex > 0) {
							const [targetChat] = updatedChats.splice(targetIndex, 1);
							return [targetChat, ...updatedChats];
						}

						return updatedChats;
					});
				}
			} catch (e) {
				console.error("Error updating chats via WS", e);
			}
		};

		return () => socket.close();
	}, [token, chats.length, activePartnerId]);

	const activeChat = chats.find((c) => c.chatPartner.id === activePartnerId);

	const handleCloseModal = () => {
		setIsModalOpen(false);
		const params = new URLSearchParams(searchParams.toString());
		params.delete("query");
		params.delete("page");
		replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleSelectNewUser = (user: UserType) => {
		handleCloseModal();
		setActivePartnerId(user.id);

		setChats((prev) => {
			const chatExists = prev.some((c) => c.chatPartner.id === user.id);
			if (chatExists) {
				return prev.map((c) =>
					c.chatPartner.id === user.id
						? { ...c, lastMessage: { ...c.lastMessage, isRead: true } }
						: c
				);
			}

			const newVirtualChat: UserWithLastMessage = {
				chatPartner: user,
				lastMessage: {
					id: 0,
					senderId: 0,
					receiverId: user.id,
					messageText: "No messages yet",
					isRead: true,
					isDeleted: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			};
			return [newVirtualChat, ...prev];
		});
	};

	const handleSelectChat = (partnerId: number) => {
		setActivePartnerId(partnerId);

		setChats((prev) =>
			prev.map((chat) =>
				chat.chatPartner.id === partnerId
					? { ...chat, lastMessage: { ...chat.lastMessage, isRead: true } }
					: chat
			)
		);
	};

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
						New Chat
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

			{chats.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center p-8 bg-gray-50/50 gap-4">
					<EmptyState message="No conversations yet" />
					<button onClick={() => setIsModalOpen(true)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
						Start a new conversation
					</button>
				</div>
			) : (
				<div className="flex flex-1 overflow-hidden">
					<div className="w-full md:w-80 border-r border-gray-100 overflow-y-auto">
						<Chats
							chats={chats}
							activePartnerId={activePartnerId}
							onSelectChat={handleSelectChat}
						/>
					</div>

					<div className="hidden md:flex flex-1 flex-col bg-slate-50/60">
						{activeChat && token && activePartnerId ? (
							<MessageWindow
								partner={activeChat.chatPartner}
								token={token}
								refreshTicket={refreshTicket}
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
			)}

			{isModalOpen && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="flex h-130 w-full max-w-md flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between pb-4 border-b border-gray-100">
							<h3 className="text-lg font-bold text-gray-900">Start new conversation</h3>
							<button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
								<X size={20} />
							</button>
						</div>

						<div className="mt-4 [&>form]:w-full">
							<Search />
						</div>

						<div className="mt-4 flex-1 overflow-y-auto space-y-1 pr-1">
							{isUsersLoading ? (
								<div className="flex justify-center py-8">
									<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
								</div>
							) : allUsers.length === 0 ? (
								<p className="text-center text-sm text-gray-400 py-8">No users found</p>
							) : (
								allUsers.map((user) => (
									<button
										key={user.id}
										onClick={() => handleSelectNewUser(user)}
										className="w-full flex flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-50"
									>
										<span className="font-semibold text-sm text-gray-900">{user.name}</span>
										<span className="text-xs text-gray-500">{user.email}</span>
									</button>
								))
							)}
						</div>

						{totalPages > 1
							&& 	<div className="mt-4 border-t border-gray-100 pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
						}
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatList;