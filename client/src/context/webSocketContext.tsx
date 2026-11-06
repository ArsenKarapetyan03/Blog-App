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
import { MessageType, UserWithLastMessage } from "@/types/types";

export interface WebSocketContextType {
	messages: MessageType[];
	setMessages: Dispatch<SetStateAction<MessageType[]>>;
	chats: UserWithLastMessage[];
	setChats: Dispatch<SetStateAction<UserWithLastMessage[]>>;
	isTyping: boolean;
	setIsTyping: Dispatch<SetStateAction<boolean>>;
	activePartnerId: number | null;
	setActivePartnerId: Dispatch<SetStateAction<number | null>>;
	sendSocketMessage: (type: string, payload: Record<string, unknown>) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({token, children}: { token: string, children: ReactNode }) => {
	const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
	const [chats, setChats] = useState<UserWithLastMessage[]>([]);
	const [messages, setMessages] = useState<MessageType[]>([]);
	const [isTyping, setIsTyping] = useState<boolean>(false);

	const socketRef = useRef<WebSocket | null>(null);
	const activePartnerIdRef = useRef(activePartnerId);

	useEffect(() => {
		activePartnerIdRef.current = activePartnerId;
	}, [activePartnerId]);

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
		if (!token) return;

		const url = new URL(WS_URL);
		url.searchParams.set("token", `Bearer ${token}`);

		const socket = new WebSocket(url.toString());
		socketRef.current = socket;

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const currentActivePartnerId = activePartnerIdRef.current;

				if (data.type === "MESSAGES_READ") {
					const {readerId, partnerId} = data.payload;
					setChats((prevChats) =>
						prevChats.map((chat) =>
							(chat.chatPartner.id === readerId || chat.chatPartner.id === partnerId) &&
							chat.lastMessage.receiverId === readerId
								? {...chat, lastMessage: {...chat.lastMessage, isRead: true}}
								: chat
						)
					);

					if (currentActivePartnerId === readerId || currentActivePartnerId === partnerId) {
						setMessages((prev) =>
							prev.map((message) =>
								((currentActivePartnerId === readerId && message.receiverId === readerId) ||
									(currentActivePartnerId === partnerId && message.senderId === currentActivePartnerId))
									? {...message, isRead: true}
									: message
							)
						);
					}
				}

				switch (data.type) {
					case "NEW_MESSAGE": {
						const message = data.payload as MessageType;

						setChats((prevChats) => {
							const existingPartner = prevChats.find(({chatPartner}) =>
								chatPartner.id === message.senderId || chatPartner.id === message.receiverId
							)?.chatPartner.id;

							const targetPartnerId = currentActivePartnerId &&
							(message.senderId === currentActivePartnerId || message.receiverId === currentActivePartnerId)
								? currentActivePartnerId
								: existingPartner ?? message.senderId;
							const isIncoming = message.senderId === targetPartnerId;

							const updatedChats = prevChats.map((chat) => {
								if (chat.chatPartner.id === targetPartnerId) {
									return {
										...chat,
										lastMessage: {
											...message,
											isRead: isIncoming && targetPartnerId === currentActivePartnerId
												? true
												: message.isRead
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

						const isCurrentChat =
							currentActivePartnerId !== null &&
							(message.senderId === currentActivePartnerId ||
								message.receiverId === currentActivePartnerId);

						if (!isCurrentChat) {
							break;
						}

						const isIncoming = message.senderId === currentActivePartnerId;
						const currentMessage = isIncoming ? {...message, isRead: true} : message;

						if (isIncoming) {
							sendSocketMessageRef.current("MARK_AS_READ", {receiverId: currentActivePartnerId});
						}

						setMessages((prev) => {
							const existingIndex = prev.findIndex(
								(msg) => msg.id === currentMessage.id ||
									(!!currentMessage.clientSideId && msg.clientSideId === currentMessage.clientSideId)
							);
							if (existingIndex !== -1) {
								const updated = [...prev];
								updated[existingIndex] = currentMessage;
								return updated;
							}

							return [...prev, currentMessage];
						});

						break;
					}

					case "MESSAGE_UPDATED": {
						setMessages((prev) =>
							prev.map(msg => msg.id === data.payload.id ? data.payload : msg)
						);
						setChats((prev) =>
							prev.map((chat) => chat.lastMessage.id === data.payload.id
								? {...chat, lastMessage: data.payload}
								: chat
							)
						);
					}
					break;

					case "MESSAGE_DELETED": {
						setMessages((prev) =>
							prev.map(msg =>
								msg.id === data.payload.messageId
									? {...msg, messageText: "Deleted message", isDeleted: true}
									: msg
							)
						);
						setChats((prev) =>
							prev.map((chat) => chat.lastMessage.id === data.payload.messageId
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
					}
					break;

					case "TYPING_STATUS":{
						const { senderId, isTyping } = data.payload;

						if (isTyping === undefined) {
							return
						}

						if (senderId === currentActivePartnerId) {
							setIsTyping(isTyping);
						}
					}
					break;
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
				activePartnerId,
				setActivePartnerId,
				isTyping,
				setIsTyping,
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
