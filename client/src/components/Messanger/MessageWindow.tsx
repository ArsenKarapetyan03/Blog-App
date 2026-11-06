"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Pen } from "lucide-react";
import { getMessages, markMessagesAsRead } from "@/actions/message";
import { MessageType, UserType } from "@/types/types";
import { MessageItem } from "./MessageItem";
import { useWebSocket } from "@/context/webSocketContext";

interface MessageWindowProps {
	partners: UserType[];
	token: string;
	refreshTicket?: number;
}

const PAGE_SIZE = 10;

export const MessageWindow = (
	{
		partners,
		token,
	}: MessageWindowProps
) => {
	const { messages, setMessages, isTyping, setIsTyping, sendSocketMessage } = useWebSocket();

	const [isLoading, setIsLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
	const [inputValue, setInputValue] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const messagesLengthRef = useRef(0);
	const partnerIdRef = useRef(partner.id);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isCurrentlyTypingRef = useRef<boolean>(false);

	useEffect(() => {
		partnerIdRef.current = partner.id;
	}, [partner.id]);

	useEffect(() => {
		messagesLengthRef.current = messages.length;
	}, [messages.length]);

	useEffect(() => {
		requestAnimationFrame(() => {
			const container = containerRef.current;
			if (container) {
				const threshold = 150;
				const isNearBottom =
					container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;

				if (isNearBottom) {
					container.scrollTo({
						top: container.scrollHeight,
						behavior: "smooth"
					});
				}
			}
		});
	}, [messages.length]);

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

				sendSocketMessage("MARK_AS_READ", { receiverId: partner.id });

				const loadedMessages = data.map((msg) =>
					msg.senderId === partner.id ? { ...msg, isRead: true } : msg
				);
				setMessages((currentMessages) => {
					const merged = new Map<number, MessageType>();
					[...loadedMessages, ...currentMessages].forEach((message) => {
						if (message.senderId === partner.id || message.receiverId === partner.id) {
							merged.set(message.id, message);
						}
					});
					return [...merged.values()].sort((a, b) =>
						a.createdAt.localeCompare(b.createdAt)
					);
				});

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
	}, [partner.id, token, sendSocketMessage, setMessages]);

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
			const currentLength = messagesLengthRef.current;
			const olderMessages = await getMessages(partner.id, token, currentLength);
			if (partnerIdRef.current !== partner.id) {
				return;
			}

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
	}, [partner.id, token, isFetchingMore, hasMore, isLoading, setMessages]);

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

	const isTypingHandler = () => {
		if (!isCurrentlyTypingRef.current) {
			isCurrentlyTypingRef.current = true;
			sendSocketMessage("TYPING_START", { receiverId: partner.id });
		}

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			sendSocketMessage("TYPING_END", { receiverId: partner.id });
			isCurrentlyTypingRef.current = false;
		}, 2000);
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
		setInputValue(e.target.value)
		isTypingHandler();
	}

	const handleStartEdit = (msg: MessageType) => {
		isTypingHandler();

		setEditingMessage(msg);
		setInputValue(msg.messageText);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleCancelEdit = () => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
		sendSocketMessage("TYPING_END", { receiverId: partner.id });
		isCurrentlyTypingRef.current = false;

		setEditingMessage(null);
		setInputValue("");
	};

	const handleDelete = async (messageId: number) => {
		if (!sendSocketMessage("DELETE_MESSAGE", {messageId, receiverId: partner.id})) {
			return;
		}

		if (editingMessage?.id === messageId) {
			handleCancelEdit();
		}

		setMessages((prev) =>
			prev.map((msg) =>
				msg.id === messageId
					? { ...msg, messageText: "Deleted message", isDeleted: true }
					: msg
			)
		);

	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape" && editingMessage) {
			handleCancelEdit();
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!inputValue.trim()) {
			return;
		}

		const messageText = inputValue.trim();

		if (editingMessage) {
			const messageId = editingMessage.id;

			if (editingMessage.messageText === messageText || editingMessage.isDeleted) {
				handleCancelEdit();
				return;
			}

			if (!sendSocketMessage("UPDATE_MESSAGE", {
				messageId,
				messageText,
				receiverId: partner.id
			})) {
				return;
			}

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId ? { ...msg, messageText } : msg
				)
			);
			handleCancelEdit();
		} else {
			const clientSideId = crypto.randomUUID();

			const tempMessage: MessageType = {
				id: clientSideId as unknown as number,
				clientSideId,
				senderId: 0,
				receiverId: partner.id,
				messageText,
				isRead: false,
				isDeleted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (!sendSocketMessage("CREATE_MESSAGE", {
				receiverId: partner.id,
				messageText,
				clientSideId
			})) {
				return;
			}

			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			sendSocketMessage("TYPING_END", { receiverId: partner.id });
			isCurrentlyTypingRef.current = false;

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

			{isTyping && <span className="px-4 py-2 text-zinc-500 text-sm bg-slate-50/50 animate-pulse">{partner.name} is typing...</span>}

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
						onChange={handleInputChange}
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
