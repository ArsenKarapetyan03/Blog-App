"use client";

import {
	RefObject,
	useState,
	useEffect,
	useRef,
	type SubmitEvent,
	type KeyboardEvent,
} from "react";
import { Ellipsis, Pencil, Check, X, Loader2, Trash, Plus } from "lucide-react";
import { Drawer, message, Modal } from "antd";
import { getChatTitle } from "@/lib/helperFunctions";
import { ChatType, UserType } from "@/types/types";
import { deleteChatMember, updateChatTitle } from "@/actions/chat";
import { InfoRow } from "@/components/ui/InfoRow";
import { cn } from "@/lib/cn";

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

	const isAdmin = chat.adminId === currentUserId;

	const [members, setMembers] = useState(chat.users || []);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [displayTitle, setDisplayTitle] = useState(initialTitle);
	const [inputTitle, setInputTitle] = useState(initialTitle);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
	const [isDeletingUser, setIsDeletingUser] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const updated = getChatTitle(chat, currentUserId);
		setDisplayTitle(updated);
		setInputTitle(updated);
		setMembers(chat.users || []);
		setIsDrawerOpen(false);
		setIsEditing(false);
	}, [chat, currentUserId]);

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
				message.error(result.message);
				return;
			}

			setDisplayTitle(trimmedTitle);
			setIsEditing(false);
			 message.success(result.message);
		} catch {
			 message.error("Network error while updating chat title.");
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
			  message.error(result.message);
			  return;
			}

			setMembers((prev) => prev.filter((member) => member.id !== userToDelete.id));

			message.success(`${userToDelete.name} was removed from the chat.`);
			setUserToDelete(null);
		} catch {
			message.error("Failed to remove user.");
		} finally {
			setIsDeletingUser(false);
		}
	};

	const hasChanges = inputTitle.trim() !== "" && inputTitle.trim() !== displayTitle;

	return (
		<div
			ref={headerRef}
			className="flex items-center justify-between px-6 py-4 shadow-sm border-b border-gray-100 bg-white"
		>
			<div>
				<h3 className="font-bold text-gray-900">{displayTitle}</h3>
				{chat.isGroup && (
					<p className="text-xs text-gray-500">
						Members: {members.length}
					</p>
				)}
			</div>

			{chat.isGroup
				&& <>
              <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label="Chat details"
                  className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-black/5 transition rounded-lg"
              >
                  <Ellipsis className="w-5 h-5" />
              </button>

							<Drawer
								title={<span className="text-sm font-semibold text-gray-800">Chat Details</span>}
								open={isDrawerOpen}
								onClose={handleCloseDrawer}
								getContainer={() => headerRef.current || document.body}
								rootStyle={{ position: "absolute" }}
							>
								<div className="flex flex-col gap-4">
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
													className={cn("w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900",
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
													hover:bg-gray-100 transition disabled:opacity-50">
													<X size={14} />
													Cancel
												</button>
												<button
													type="submit"
													disabled={isSubmitting || !hasChanges || !isAdmin}
													className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
												>
													{isSubmitting ? (
														<Loader2 size={14} className="animate-spin" />
													) : (
														<Check size={14} />
													)}
													Save
												</button>
											</div>
										</form>
									) : (
										<div
											onClick={() => setIsEditing(true)}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") setIsEditing(true);
											}}
											className={cn("group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-gray-50/80 px-3 py-2.5",
											 "hover:border-gray-200 hover:bg-gray-100/70 transition",
												isAdmin && "cursor-pointer",
											)}
										>
											<span className="text-base font-semibold text-gray-900 break-words">
												{displayTitle}
											</span>
											{isAdmin &&
												<span className="shrink-0 rounded-md p-1.5 text-gray-400 group-hover:bg-white group-hover:text-gray-700 group-hover:shadow-xs transition">
												<Pencil size={15} />
											</span>}
										</div>
									)}

									<div className="flex-1 flex flex-col gap-2 overflow-y-auto">
										{members.map(user =>(
											<div
												key={user.id}
												className="flex justify-between items-center"
											>
												<InfoRow name={user.name} />

												{user.id === chat.adminId ?
													<span className="pl-4 text-sm text-zinc-500 font-semibold">admin</span>
													: isAdmin && <button onClick={() => setUserToDelete(user)}>
                            <Trash size={16} className="hover:text-red-500 cursor-pointer" />
                        </button>
												}
											</div>
										))}
									</div>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
                        text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
                    >
		                    <Plus size={16} />
                        Add member
                    </button>

								</div>
				      </Drawer>

              <Modal
                  title="Remove member"
                  open={!!userToDelete}
                  onOk={handleConfirmDelete}
                  onCancel={() => setUserToDelete(null)}
                  okText="Remove"
                  okButtonProps={{ danger: true, loading: isDeletingUser }}
                  cancelButtonProps={{ disabled: isDeletingUser }}
                  centered
              >
                  <p>
                      Are you sure you want to remove{" "}
                      <span className="font-semibold">{userToDelete?.name}</span> from this group?
                  </p>
              </Modal>
					</>
			}
		</div>
	);
};