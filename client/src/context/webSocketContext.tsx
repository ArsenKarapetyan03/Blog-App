"use client";

import {
	createContext,
	useContext,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
	Dispatch,
	SetStateAction
} from "react";
import { WS_URL } from "@/config/api";
import { ChatType, MessageType, UserType } from "@/types/types";

export interface WebSocketContextType {
	messages: MessageType[];
	setMessages: Dispatch<SetStateAction<MessageType[]>>;
	chats: ChatType[];
	setChats: Dispatch<SetStateAction<ChatType[]>>;
	typingUsers: Record<number, boolean>;
	setTypingUsers: Dispatch<SetStateAction<Record<number, boolean>>>;
	activeChatId: number | null;
	setActiveChatId: Dispatch<SetStateAction<number | null>>;
	sendSocketMessage: (type: string, payload: Record<string, unknown>) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = (
	{
		token,
		user,
		children
	}: {
		token: string,
		user: {
			id: number;
			name: string;
			email: string;
		},
		children: ReactNode
	}
) => {
	const [activeChatId, setActiveChatId] = useState<number | null>(null);
	const [chats, setChats] = useState<ChatType[]>([]);
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
	const socketRef = useRef<WebSocket | null>(null);
	const activeChatIdRef = useRef(activeChatId);

	useEffect(() => {
		activeChatIdRef.current = activeChatId;
		setTypingUsers({});
	}, [activeChatId]);

	const sendSocketMessage = useCallback((type: string, payload: Record<string, unknown>) => {
		const socket = socketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			return false;
		}
		socket.send(JSON.stringify({type, payload}));
		return true;
	}, []);

	const sendSocketMessageRef = useRef(sendSocketMessage);

	useEffect(() => {
		sendSocketMessageRef.current = sendSocketMessage;
	}, [sendSocketMessage]);

	useEffect(() => {
		if (!token) {
			return;
		}

		const url = new URL(WS_URL);
		url.searchParams.set("token", `Bearer ${token}`);

		const socket = new WebSocket(url.toString());
		socketRef.current = socket;

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const currentActiveChatId = activeChatIdRef.current;

				if (data.type === "MESSAGES_READ") {
					const { readerId, chatId } = data.payload;

					setChats((prevChats) =>
						prevChats.map((chat) =>
							chat.id === chatId && chat.lastMessage
								? { ...chat, lastMessage: { ...chat.lastMessage, isRead: true } }
								: chat
						)
					);

					if (currentActiveChatId === chatId) {
						setMessages((prev) =>
							prev.map((message) =>
								message.chatId === chatId && message.senderId !== readerId
									? { ...message, isRead: true }
									: message
							)
						);
					}
					return;
				}

				switch (data.type) {
					case "NEW_MESSAGE": {
						const message = data.payload as MessageType;
						const msgChatId = message.chatId;
						const isCurrentChatActive = msgChatId === currentActiveChatId;

						const shouldMarkAsReadNow = isCurrentChatActive && message.senderId !== user.id;

						setChats((prevChats) => {
							const updatedChats = prevChats.map((chat) => {
								if (chat.id === msgChatId) {
									return {
										...chat,
										lastMessage: {
											...message,
											isRead: shouldMarkAsReadNow ? true : message.isRead
										}
									};
								}
								return chat;
							});

							const targetChat = updatedChats.find(c => c.id === msgChatId);
							if (targetChat) {
								const filteredChats = updatedChats.filter(c => c.id !== msgChatId);
								return [targetChat, ...filteredChats];
							}

							return updatedChats;
						});

						if (!isCurrentChatActive) {
							break;
						}

						if (message.senderId !== user.id && !message.isRead) {
							sendSocketMessageRef.current("MARK_AS_READ", { chatId: msgChatId });
						}

						const currentMessage = {
							...message,
							isRead: shouldMarkAsReadNow ? true : message.isRead
						};

						setMessages((prev) => {
							const existingIndex = prev.findIndex(
								(msg) => msg.id === currentMessage.id ||
									(!!currentMessage.clientSideId && msg.clientSideId === currentMessage.clientSideId)
							);
							if (existingIndex !== -1) {
								return prev.map((msg, idx) => idx === existingIndex ? currentMessage : msg);
							}

							return [...prev, currentMessage];
						});

						break;
					}

					case "MESSAGE_UPDATED": {
						const updatedMsg = data.payload;
						setMessages((prev) =>
							prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg)
						);
						setChats((prev) =>
							prev.map((chat) => chat.lastMessage?.id === updatedMsg.id
								? {...chat, lastMessage: updatedMsg}
								: chat
							)
						);
						break;
					}

					case "MESSAGE_DELETED": {
						const { messageId } = data.payload;
						setMessages((prev) =>
							prev.map(msg =>
								msg.id === messageId
									? {...msg, messageText: "Deleted message", isDeleted: true}
									: msg
							)
						);
						setChats((prev) =>
							prev.map((chat) => chat.lastMessage?.id === messageId
								? {
									...chat,
									lastMessage: {
										...chat.lastMessage,
										messageText: "Deleted message",
										isDeleted: true,
									}
								}
								: chat
							)
						);
						break;
					}

					case "TYPING_STATUS": {
						const { senderId, chatId, isTyping } = data.payload;

						if (isTyping === undefined || currentActiveChatId !== chatId || senderId === user?.id) {
							return;
						}

						setTypingUsers((prev) => {
							const updated = { ...prev };
							if (isTyping) {
								updated[senderId] = true;
							} else {
								delete updated[senderId];
							}
							return updated;
						});
						break;
					}
				}

			} catch (e) {
				console.error("Error updating chats via WS", e);
			}
		};

		return () => {
			socket.close();
			socketRef.current = null;
		};
	}, [token]);

	return (
		<WebSocketContext.Provider
			value={{
				messages,
				setMessages,
				chats,
				setChats,
				activeChatId,
				setActiveChatId,
				typingUsers,
				setTypingUsers,
				sendSocketMessage,
			}}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};
