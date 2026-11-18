"use client";

import { SubmitEvent, useState, useEffect, useCallback } from "react";
import { notification } from "antd";
import { cn } from "@/lib/cn";
import { createChat, addChatMembers } from "@/actions/chat";
import { fetchAllUsersApi } from "@/actions/user";
import { UserType, ChatType } from "@/types/types";
import { Search } from "@/components/Search";
import Pagination from "@/components/Pagination";
import { X, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMessage } from "@/context/MessageContext";
import { useWebSocket } from "@/context/webSocketContext";

interface SelectUserProps {
	token: string;
	chatId?: number;
	existingMemberIds?: number[];
	isOpen?: boolean;
	onClose?: () => void;
}

export const SelectUsers = ({
	                            token,
	                            chatId,
	                            existingMemberIds = [],
	                            isOpen,
	                            onClose,
                            }: SelectUserProps) => {
	const pathname = usePathname();
	const {replace} = useRouter();
	const searchParams = useSearchParams();

	const {isAddUserModalOpen, setIsAddUserModalOpen} = useMessage();
	const {chats, setChats, setActiveChatId} = useWebSocket();
	const [api, contextHolder] = notification.useNotification();

	const modalVisible = isOpen !== undefined ? isOpen : isAddUserModalOpen;
	const isAddMemberMode = Boolean(chatId);

	const currentQuery = searchParams.get("query") || "";
	const currentPage = parseInt(searchParams.get("page") || "1", 10);

	const [allUsers, setAllUsers] = useState<UserType[]>([]);
	const [totalUsersPages, setTotalUsersPages] = useState(1);
	const [isUsersLoading, setIsUsersLoading] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
	const [groupName, setGroupName] = useState("");

	const showNotification = useCallback(
		(type: "success" | "error", description: string) => {
			api[type]({
				title: type === "success" ? "Success" : "Error",
				description,
				placement: "topRight",
			});
		},
		[api]
	);

	const fetchAllUsers = useCallback(
		async (query: string, page: number) => {
			if (!token || !modalVisible) return;

			setIsUsersLoading(true);
			try {
				const {users, totalPages} = await fetchAllUsersApi({
					query,
					page,
					token,
				});
				setAllUsers(users);
				setTotalUsersPages(totalPages);
			} catch (err) {
				console.error("Failed to fetch users:", err);
				showNotification("error", "Failed to load users.");
			} finally {
				setIsUsersLoading(false);
			}
		},
		[token, modalVisible, showNotification]
	);

	useEffect(() => {
		fetchAllUsers(currentQuery, currentPage);
	}, [currentQuery, currentPage, fetchAllUsers]);

	const handleCloseModal = () => {
		if (onClose) {
			onClose();
		} else {
			setIsAddUserModalOpen(false);
		}

		const params = new URLSearchParams(searchParams.toString());
		params.delete("query");
		params.delete("page");
		replace(`${pathname}?${params.toString()}`, {scroll: false});
		setSelectedUsers([]);
		setGroupName("");
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!token || isSubmitting || selectedUsers.length === 0) {
			return;
		}

		const selectedUserIds = selectedUsers.map((u) => u.id);

		if (isAddMemberMode && chatId) {
			const previousChats: ChatType[] = chats;
			const usersToAdd = [...selectedUsers];

			setChats((prev) =>
				prev.map((c) => {
					if (c.id !== chatId) return c;
					const existingIds = new Set(c.users.map((u) => u.id));
					const uniqueNewUsers = usersToAdd.filter((u) => !existingIds.has(u.id));
					return {
						...c,
						users: [...c.users, ...uniqueNewUsers],
					};
				})
			);

			handleCloseModal();

			try {
				const res = await addChatMembers(chatId, selectedUserIds, token);

				if (!res.success) {
					throw new Error(res.message || "Could not add members");
				}

				showNotification("success", res.message || "Members added successfully.");
			} catch (err) {
				setChats(previousChats);
				showNotification(
					"error",
					err instanceof Error ? err.message : "Failed to add members."
				);
			}
			return;
		}

		setIsSubmitting(true);
		try {
			const isGroup = selectedUserIds.length > 1;
			const title = isGroup ? groupName.trim() : null;

			const newChat = await createChat(
				{participantIds: selectedUserIds, isGroup, title},
				token
			);

			if (!newChat.success || !newChat.data) {
				showNotification("error", newChat.message || "Could not create chat room.");
				return;
			}

			setChats((prev) => {
				const filtered = prev.filter(
					(c) => !selectedUserIds.includes(Math.abs(c.id)) || c.id > 0
				);
				if (filtered.some((c) => c.id === newChat.data.id)) {
					return filtered;
				}
				return [newChat.data, ...filtered];
			});

			setActiveChatId(newChat.data.id);
			sessionStorage.setItem("selectedChatId", JSON.stringify(newChat.data.id));
			showNotification("success", newChat.message || "Chat created.");
			handleCloseModal();
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Could not create chat room."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleUserSelection = (user: UserType) => {
		if (existingMemberIds.includes(user.id)) {
			return;
		}

		setSelectedUsers((prev) =>
			prev.some((u) => u.id === user.id)
				? prev.filter((u) => u.id !== user.id)
				: [...prev, user]
		);
	};

	const modalTitle = isAddMemberMode
		? "Add Group Members"
		: selectedUsers.length > 1
			? "Create Group Chat"
			: "Select users";

	const submitButtonText = isAddMemberMode
		? `Add (${selectedUsers.length})`
		: selectedUsers.length > 1
			? "Create Group"
			: "Start Chat";

	return (
		<>
			{contextHolder}

			{modalVisible && (
				<div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<form id="select-users-form" onSubmit={handleSubmit} className="hidden"/>

					<div
						className="flex h-140 w-full max-w-md flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between border-b border-gray-100 pb-4">
							<h3 className="text-lg font-bold text-gray-900">{modalTitle}</h3>
							<button
								type="button"
								onClick={handleCloseModal}
								className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
							>
								<X size={20}/>
							</button>
						</div>

						<div className="flex-1 space-y-4 overflow-y-auto py-4">
							{!isAddMemberMode && selectedUsers.length > 1 && (
								<div className="space-y-1.5">
									<label
										htmlFor="groupName"
										className="text-xs font-semibold uppercase tracking-wider text-gray-500"
									>
										Group Name
									</label>
									<input
										id="groupName"
										type="text"
										required
										value={groupName}
										onChange={(e) => setGroupName(e.target.value)}
										placeholder="Enter group name..."
										className="w-full rounded-2xl border border-zinc-400 p-2 hover:placeholder:text-indigo-600 focus:border-indigo-500 focus:outline-none"
									/>
								</div>
							)}

							<div className="space-y-1.5">
								<Search/>
							</div>

							<div className="max-h-60 space-y-1 overflow-y-auto pr-1">
								{isUsersLoading ? (
									<div className="flex items-center justify-center py-8">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>
									</div>
								) : allUsers.length === 0 ? (
									<p className="py-6 text-center text-sm text-gray-500">No users found</p>
								) : (
									allUsers.map((item) => {
										const isAlreadyMember = existingMemberIds.includes(item.id);
										const isSelected = selectedUsers.some((u) => u.id === item.id);

										return (
											<button
												key={item.id}
												type="button"
												disabled={isAlreadyMember}
												onClick={() => toggleUserSelection(item)}
												className={cn(
													"flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors",
													isAlreadyMember
														? "cursor-not-allowed opacity-50"
														: "hover:bg-gray-50",
													isSelected && "bg-blue-50/50 hover:bg-blue-50"
												)}
											>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-semibold text-gray-900">
														{item.name || `User #${item.id}`}
													</p>
													<p className="truncate text-xs text-gray-400">
														{isAlreadyMember ? "Already in group" : `@${item.name}`}
													</p>
												</div>
												<div
													className={cn(
														"flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
														isSelected || isAlreadyMember
															? "border-blue-600 bg-blue-600 text-white"
															: "border-gray-300 bg-white"
													)}
												>
													{(isSelected || isAlreadyMember) && (
														<Check size={14} strokeWidth={3}/>
													)}
												</div>
											</button>
										);
									})
								)}
							</div>

							{!isUsersLoading && allUsers.length > 0 && (
								<div className="border-t border-gray-50 pt-2 text-lg">
									<Pagination totalPages={totalUsersPages} currentPage={currentPage}/>
								</div>
							)}
						</div>

						<div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
							<button
								type="button"
								onClick={handleCloseModal}
								className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="select-users-form"
								disabled={isSubmitting || selectedUsers.length === 0}
								className="inline-flex min-w-28 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
							>
								{isSubmitting ? (
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"/>
								) : (
									submitButtonText
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};