"use client";

import { RefObject, useState, useEffect, useRef, type SubmitEvent, type KeyboardEvent } from "react";
import { Ellipsis, Pencil, Check, X, Loader2, Trash, Plus, LogOut } from "lucide-react";
import { Drawer, notification, Modal } from "antd";
import { getChatTitle } from "@/lib/helperFunctions";
import { ChatType, UserType } from "@/types/types";
import { deleteChatMember, updateChatTitle, deleteChat } from "@/actions/chat";
import { InfoRow } from "@/components/ui/InfoRow";
import { cn } from "@/lib/cn";
import { SelectUsers } from "@/components/Messanger/SelectUsers";
import { useWebSocket } from "@/context/webSocketContext";

export const MessageWindowHeader = (
	{
		chat,
		currentUserId,
		headerRef,
		token,
	}: {
		chat: ChatType;
		currentUserId: number;
		headerRef: RefObject<HTMLDivElement | null>;
		token: string;
	}) => {
	const initialTitle = getChatTitle(chat, currentUserId);

	const {setChats} = useWebSocket();
	const [api, contextHolder] = notification.useNotification();

	const [members, setMembers] = useState(chat.users || []);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [displayTitle, setDisplayTitle] = useState(initialTitle);
	const [inputTitle, setInputTitle] = useState(initialTitle);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
	const [isDeletingUser, setIsDeletingUser] = useState(false);
	const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
	const [isDeleteChatOpen, setIsDeleteChatOpen] = useState(false);
	const [isDeletingChat, setIsDeletingChat] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const isAdmin = chat.adminId === currentUserId;
	const hasChanges = inputTitle.trim() !== "" && inputTitle.trim() !== displayTitle;
	const isLeaving = userToDelete?.id === currentUserId;

	const showNotification = (type: "success" | "error", description: string) => {
		api[type]({
			title: type === "success" ? "Success" : "Error",
			description,
			placement: "topRight",
		});
	};

	useEffect(() => {
		const updated = getChatTitle(chat, currentUserId);
		setDisplayTitle(updated);
		setInputTitle(updated);
		setMembers(chat.users || []);
		setIsEditing(false);
		setIsDeleteChatOpen(false);
	}, [chat, currentUserId]);

	useEffect(() => {
		setIsDrawerOpen(false);
	}, [chat.id]);

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [isEditing]);

	const handleCancelEdit = () => {
		setInputTitle(displayTitle);
		setIsEditing(false);
	};

	const handleCloseDrawer = () => {
		handleCancelEdit();
		setIsDrawerOpen(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			handleCancelEdit();
		}
	};

	const handleSubmit = async (e?: SubmitEvent) => {
		e?.preventDefault();

		const trimmedTitle = inputTitle.trim();
		if (!trimmedTitle || trimmedTitle === displayTitle) {
			handleCancelEdit();
			return;
		}

		try {
			setIsSubmitting(true);
			const result = await updateChatTitle(trimmedTitle, chat.id, token);

			if (!result.success) {
				showNotification("error", result.message);
				return;
			}

			setDisplayTitle(trimmedTitle);
			setChats((prevState) =>
				prevState.map((ch) => (ch.id === chat.id ? {...ch, title: trimmedTitle} : ch))
			);
			setIsEditing(false);
			showNotification("success", result.message);
		} catch {
			showNotification("error", "Network error while updating chat title.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) {
			return;
		}

		try {
			setIsDeletingUser(true);
			const result = await deleteChatMember(chat.id, userToDelete.id, token);
			if (!result.success) {
				showNotification("error", result.message);
				return;
			}

			if (isLeaving) {
				setChats((prev) => prev.filter((c) => c.id !== chat.id));
				setIsDrawerOpen(false);
				showNotification("success", result.message);
			} else {
				setMembers((prev) => prev.filter((member) => member.id !== userToDelete.id));
				showNotification("success", result.message);
			}

			setUserToDelete(null);
		} catch {
			showNotification("error", isLeaving ? "Failed to leave chat." : "Failed to remove user.");
		} finally {
			setIsDeletingUser(false);
		}
	};

	const handleLeave = () => {
		const currentUser = members.find((u) => u.id === currentUserId) ?? null;
		setUserToDelete(currentUser);
	};

	const handleConfirmDeleteChat = async () => {
		try {
			setIsDeletingChat(true);
			const result = await deleteChat(chat.id, token);
			if (!result.success) {
				showNotification("error", result.message);
				return;
			}

			setChats((prev) => prev.filter((c) => c.id !== chat.id));
			setIsDeleteChatOpen(false);
			setIsDrawerOpen(false);
			showNotification("success", result.message);
		} catch {
			showNotification("error", "Failed to delete chat.");
		} finally {
			setIsDeletingChat(false);
		}
	};

	return (
		<div
			ref={headerRef}
			className="flex items-center justify-between px-6 py-4 shadow-sm border-b border-gray-100 bg-white"
		>
			{contextHolder}

			<div>
				<h3 className="font-bold text-gray-900">{displayTitle}</h3>
				{chat.isGroup && (
					<p className="text-xs text-gray-500">
						Members: {members.length}
					</p>
				)}
			</div>

			{chat.isGroup && (
				<>
					<button
						type="button"
						onClick={() => setIsDrawerOpen(true)}
						aria-label="Chat details"
						className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-black/5 transition rounded-lg"
					>
						<Ellipsis className="w-5 h-5"/>
					</button>

					<Drawer
						title={<span className="text-sm font-semibold text-gray-800">Chat Details</span>}
						open={isDrawerOpen}
						onClose={handleCloseDrawer}
						getContainer={() => headerRef.current || document.body}
						rootStyle={{position: "absolute"}}
					>
						<div className="h-full flex flex-col justify-end gap-4">
							<label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
								Chat Name
							</label>

							{isAdmin && isEditing ? (
								<form onSubmit={handleSubmit} className="space-y-2">
									<div className="flex items-center gap-1.5">
										<input
											ref={inputRef}
											type="text"
											value={inputTitle}
											onChange={(e) => setInputTitle(e.target.value)}
											onKeyDown={handleKeyDown}
											disabled={isSubmitting}
											placeholder="Enter chat title..."
											maxLength={60}
											className={cn(
												"w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900",
												"shadow-xs transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10",
												"disabled:bg-gray-50 disabled:text-gray-400",
												!isAdmin && "cursor-default"
											)}
										/>
									</div>

									<div className="flex items-center justify-end gap-1.5">
										<button
											type="button"
											onClick={handleCancelEdit}
											disabled={isSubmitting}
											className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600
											hover:bg-gray-100 transition disabled:opacity-50"
										>
											<X size={14}/>
											Cancel
										</button>
										<button
											type="submit"
											disabled={isSubmitting || !hasChanges || !isAdmin}
											className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
										>
											{isSubmitting ? (
												<Loader2 size={14} className="animate-spin"/>
											) : (
												<Check size={14}/>
											)}
											Save
										</button>
									</div>
								</form>
							) : (
								<div
									onClick={() => isAdmin && setIsEditing(true)}
									role={isAdmin ? "button" : undefined}
									tabIndex={isAdmin ? 0 : undefined}
									onKeyDown={(e) => {
										if (isAdmin && (e.key === "Enter" || e.key === " ")) {
											setIsEditing(true);
										}
									}}
									className={cn(
										"group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-gray-50/80 px-3 py-2.5",
										isAdmin && "cursor-pointer hover:border-gray-200 hover:bg-gray-100/70 transition"
									)}
								>
									<span className="text-base font-semibold text-gray-900 break-words">
										{displayTitle}
									</span>
									{isAdmin && (
										<span
											className="shrink-0 rounded-md p-1.5 text-gray-400 group-hover:bg-white group-hover:text-gray-700 group-hover:shadow-xs transition">
											<Pencil size={15}/>
										</span>
									)}
								</div>
							)}

							<div className="flex-1 flex flex-col gap-2 overflow-y-auto">
								{members.map((user) => (
									<div
										key={user.id}
										className="flex justify-between items-center"
									>
										<InfoRow name={user.name}/>

										{user.id === chat.adminId ? (
											<span className="pl-4 text-sm text-zinc-500 font-semibold">admin</span>
										) : (
											isAdmin && (
												<button onClick={() => setUserToDelete(user)}>
													<Trash size={16} className="hover:text-red-500 cursor-pointer"/>
												</button>
											)
										)}
									</div>
								))}
							</div>

							{isAdmin && (
								<>
									<button
										type="button"
										onClick={() => setIsAddMemberOpen(true)}
										className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
										text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500
										focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
									>
										<Plus size={16}/>
										Add member
									</button>

									<button
										type="button"
										onClick={() => setIsDeleteChatOpen(true)}
										className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm
										font-semibold text-white shadow-sm transition-all hover:bg-red-500 active:scale-[0.98]"
									>
										<Trash size={16}/>
										Delete chat
									</button>
								</>
							)}

							<button
								type="button"
								onClick={handleLeave}
								className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm
								font-semibold text-white shadow-sm transition-all hover:bg-red-500 active:scale-[0.98]"
							>
								<LogOut size={16}/>
								Leave group
							</button>

							<SelectUsers
								token={token}
								chatId={chat.id}
								existingMemberIds={members.map((u) => u.id)}
								isOpen={isAddMemberOpen}
								onClose={() => setIsAddMemberOpen(false)}
							/>
						</div>
					</Drawer>

					<Modal
						title={isLeaving ? "Leave group" : "Remove member"}
						open={!!userToDelete}
						onOk={handleConfirmDelete}
						onCancel={() => setUserToDelete(null)}
						okText={isLeaving ? "Leave" : "Remove"}
						okButtonProps={{danger: true, loading: isDeletingUser}}
						cancelButtonProps={{disabled: isDeletingUser}}
						centered
					>
						{isLeaving ? (
							<p>Are you sure you want to leave this group?</p>
						) : (
							<p>
								Are you sure you want to remove{" "}
								<span className="font-semibold">{userToDelete?.name}</span> from this group?
							</p>
						)}
					</Modal>

					<Modal
						title="Delete chat"
						open={isDeleteChatOpen}
						onOk={handleConfirmDeleteChat}
						onCancel={() => setIsDeleteChatOpen(false)}
						okText="Delete"
						okButtonProps={{danger: true, loading: isDeletingChat}}
						cancelButtonProps={{disabled: isDeletingChat}}
						centered
					>
						<p>
							Are you sure you want to permanently delete{" "}
							<span className="font-semibold">{displayTitle}</span>? This action cannot be undone.
						</p>
					</Modal>
				</>
			)}
		</div>
	);
};
