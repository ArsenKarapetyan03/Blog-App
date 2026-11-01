"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageType, UserType } from "@/types/types";
import { MessageItem } from "./MessageItem";
import { BASE_URL } from "@/config/api";

interface MessageWindowProps {
	partner: UserType;
	token: string;
}

const PAGE_SIZE = 10;

const getMessages = async (
	partnerId: number,
	token: string,
	offset: number
): Promise<MessageType[]> => {
	const params = new URLSearchParams({
		partnerId: String(partnerId),
		offset: String(offset),
	});

	const response = await fetch(`${BASE_URL}/message?${params}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) throw new Error("Failed to fetch messages");

	const data = await response.json();
	return (data.messages || []).reverse();
};

const sendMessage = async (
	partnerId: number,
	token: string,
	messageText: string
) => {
	const response = await fetch(`${BASE_URL}/message`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ partnerId, messageText }),
	});

	if (!response.ok) throw new Error("Failed to send message");
};

const markMessagesAsRead = async (
	partnerId: number,
	token: string
) => {
	const response = await fetch(
		`${BASE_URL}/message/read`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({partnerId})
		}
	);

	if (!response.ok) {
		throw new Error("Failed to mark messages as read");
	}
};

export const MessageWindow = ({ partner, token }: MessageWindowProps) => {
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const formRef = useRef<HTMLFormElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const previousMessagesCount = useRef(0);

	useEffect(() => {
		let cancelled = false;

		const loadMessages = async () => {
			setIsLoading(true);
			setMessages([]);
			setHasMore(true);

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
				previousMessagesCount.current = 0;
			} catch (error) {
				if (!cancelled) console.error(error);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		loadMessages();

		return () => {
			cancelled = true;
		};
	}, [partner.id, token]);

	useEffect(() => {
		if (isLoading || isFetchingMore) return;

		const previousCount = previousMessagesCount.current;
		previousMessagesCount.current = messages.length;

		if (previousCount === 0 && messages.length > 0) {
			containerRef.current?.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "auto",
			});
			return;
		}

		if (messages.length > previousCount) {
			containerRef.current?.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages.length, isLoading, isFetchingMore]);

	const loadMore = useCallback(async () => {
		if (isFetchingMore || !hasMore || isLoading) {
			return;
		}

		const container = containerRef.current;
		if (!container) {
			return;
		}

		const oldHeight = container.scrollHeight;
		const oldTop = container.scrollTop;

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

			requestAnimationFrame(() => {
				container.scrollTop =
					oldTop + (container.scrollHeight - oldHeight);
			});
		} catch (error) {
			console.error("Failed to load older messages:", error);
		} finally {
			setIsFetchingMore(false);
		}
	}, [partner.id, token, messages.length, hasMore, isFetchingMore, isLoading]);

	useEffect(() => {
		const container = containerRef.current;
		const sentinel = sentinelRef.current;

		if (!container || !sentinel || !hasMore) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					loadMore();
				}
			},
			{
				root: container,
				rootMargin: "150px 0px 0px 0px",
			}
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [loadMore, hasMore]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const formData = new FormData(form);
		const text = formData.get("message");

		if (typeof text !== "string" || !text.trim()) {
			return;
		}

		const messageText = text.trim();

		const tempMessage: MessageType = {
			id: Date.now(),
			senderId: 0,
			receiverId: partner.id,
			messageText,
			isRead: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		form.reset();
		setMessages((prev) => [...prev, tempMessage]);

		try {
			await sendMessage(partner.id, token, messageText);
		} catch (error) {
			console.error(error);
			setMessages((prev) =>
				prev.filter((msg) => msg.id !== tempMessage.id)
			);
		}
	};

	return (
		<div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
			<div className="px-6 py-4 shadow-xl">
				<h3 className="font-bold text-gray-900">{partner.name}</h3>
				<p className="text-xs text-indigo-500">{partner.email}</p>
			</div>

			<div
				ref={containerRef}
				className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-6"
			>
				{hasMore && !isLoading && (
					<div ref={sentinelRef} className="h-2" />
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
						/>
					))
				)}
			</div>

			<div className="p-4 bg-white border-t border-zinc-100">
				<form
					ref={formRef}
					onSubmit={handleSubmit}
					className="flex items-center gap-2"
				>
					<input
						name="message"
						type="text"
						placeholder="Type a message..."
						className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
					/>

					<button
						type="submit"
						className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
};

export default MessageWindow;