"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Pen } from "lucide-react";
import { getMessages, markMessagesAsRead, updateMessage, sendMessage, deleteMessage } from "@/actions/message";
import { MessageType, UserType } from "@/types/types";
import { MessageItem } from "./MessageItem";

interface MessageWindowProps {
	partner: UserType;
	token: string;
	refreshTicket?: number;
}

const PAGE_SIZE = 10;

export const MessageWindow = (
	{
		partner,
		token,
		refreshTicket = 0
	}: MessageWindowProps
) => {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
	const [inputValue, setInputValue] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.style.overflowAnchor = "none";
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		const loadMessages = async () => {
			setIsLoading(true);
			setMessages([]);
			setHasMore(true);
			setEditingMessage(null);
			setInputValue("");

			try {
				const data = await getMessages(partner.id, token, 0);
				await markMessagesAsRead(partner.id, token);

				if (cancelled) {
					return;
				}

				setMessages(
					data.map((msg) =>
						msg.senderId === partner.id
							? { ...msg, isRead: true }
							: msg
					)
				);

				setHasMore(data.length === PAGE_SIZE);

				requestAnimationFrame(() => {
					if (containerRef.current) {
						containerRef.current.scrollTop = containerRef.current.scrollHeight;
					}
				});
			} catch (error) {
				if (!cancelled) {
					console.error(error);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		loadMessages();

		return () => {
			cancelled = true;
		};
	}, [partner.id, token, refreshTicket]);

	const loadMore = useCallback(async () => {
		if (isFetchingMore || !hasMore || isLoading) {
			return;
		}

		const container = containerRef.current;
		if (!container) {
			return;
		}

		const previousScrollHeight = container.scrollHeight;
		const previousScrollTop = container.scrollTop;

		setIsFetchingMore(true);

		try {
			const olderMessages = await getMessages(
				partner.id,
				token,
				messages.length
			);

			if (!olderMessages.length) {
				setHasMore(false);
				return;
			}

			setMessages((prev) => [...olderMessages, ...prev]);
			setHasMore(olderMessages.length === PAGE_SIZE);

			const resizeObserver = new ResizeObserver(() => {
				const currentScrollHeight = container.scrollHeight;
				const heightDifference = currentScrollHeight - previousScrollHeight;

				if (heightDifference > 0) {
					container.scrollTop = previousScrollTop + heightDifference;
				}

				resizeObserver.disconnect();
			});

			resizeObserver.observe(container);

		} catch (error) {
			console.error("Failed to load older messages:", error);
		} finally {
			setIsFetchingMore(false);
		}
	}, [partner.id, token, messages.length, hasMore, isFetchingMore, isLoading]);

	useEffect(() => {
		const container = containerRef.current;
		const sentinel = sentinelRef.current;

		if (!container || !sentinel || !hasMore) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					loadMore();
				}
			},
			{
				root: container,
				rootMargin: "80px 0px 0px 0px",
			}
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [loadMore, hasMore]);

	const handleStartEdit = (msg: MessageType) => {
		setEditingMessage(msg);
		setInputValue(msg.messageText);
		inputRef.current?.focus();
	};

	const handleCancelEdit = () => {
		setEditingMessage(null);
		setInputValue("");
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!inputValue.trim()) {
			return;
		}

		const messageText = inputValue.trim();

		if (editingMessage) {
			const messageId = editingMessage.id;
			const originalMessages = [...messages];

			if (editingMessage.messageText === messageText) {
				handleCancelEdit();
				return;
			}

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId ? { ...msg, messageText } : msg
				)
			);

			handleCancelEdit();

			try {
				await updateMessage(messageId, messageText, token);
			} catch (error) {
				console.error("Failed to update message:", error);
				setMessages(originalMessages);
			}
		} else {
			const tempMessage: MessageType = {
				id: Date.now(),
				senderId: 0,
				receiverId: partner.id,
				messageText,
				isRead: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			setInputValue("");

			setMessages((prev) => [...prev, tempMessage]);

			requestAnimationFrame(() => {
				if (containerRef.current) {
					containerRef.current.scrollTo({
						top: containerRef.current.scrollHeight,
						behavior: "smooth",
					});
				}
			});

			try {
				await sendMessage(partner.id, token, messageText);
			} catch (error) {
				console.error(error);
				setMessages((prev) =>
					prev.filter((msg) => msg.id !== tempMessage.id)
				);
			}
		}
	};

	const handleDelete = async (messageId: number) => {
		if (editingMessage?.id === messageId) {
			handleCancelEdit();
		}

		const originalMessages = [...messages];

		setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

		try {
			await deleteMessage(messageId, token);
		} catch (error) {
			console.error("Failed to delete message:", error);
			setMessages(originalMessages);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape" && editingMessage) {
			handleCancelEdit();
		}
	};

	return (
		<div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
			<div className="px-6 py-4 shadow-xl z-10">
				<h3 className="font-bold text-gray-900">{partner.name}</h3>
				<p className="text-xs text-indigo-500">{partner.email}</p>
			</div>

			<div
				ref={containerRef}
				className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-6"
			>
				{hasMore && !isLoading && (
					<div ref={sentinelRef} className="h-1 w-full" />
				)}

				{isFetchingMore && (
					<p className="py-2 text-center text-xs text-gray-400">
						Loading previous messages...
					</p>
				)}

				{isLoading ? (
					<div className="flex h-full items-center justify-center">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
					</div>
				) : messages.length === 0 ? (
					<p className="py-10 text-center text-sm text-gray-400">
						No messages here yet.
					</p>
				) : (
					messages.map((msg) => (
						<MessageItem
							key={msg.id}
							msg={msg}
							isPartner={msg.senderId === partner.id}
							onStartEdit={handleStartEdit}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>

			{editingMessage && (
				<div className="px-6 py-2 bg-blue-50 border-t border-blue-100 flex justify-between items-center text-sm text-blue-700">
					<div className="flex items-center gap-2 truncate">
						<Pen size={16} />
						<span className="truncate">Editing: <span className="font-medium text-blue-900">{editingMessage.messageText}</span></span>
					</div>
					<button
						type="button"
						onClick={handleCancelEdit}
						className="p-1 rounded text-gray-400 hover:text-gray-600 focus:outline-none"
					>
						<X size={16} />
					</button>
				</div>
			)}

			<div className="p-4 bg-white border-t border-zinc-100">
				<form
					onSubmit={handleSubmit}
					className="flex items-center gap-2"
				>
					<input
						ref={inputRef}
						name="message"
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
						className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
					/>

					<button
						type="submit"
						className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
							editingMessage ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
						}`}
					>
						{editingMessage ? "Save" : "Send"}
					</button>
				</form>
			</div>
		</div>
	);
};
