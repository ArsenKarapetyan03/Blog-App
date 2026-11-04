import { WebSocket } from "ws";
import type { AuthenticatedWebSocket } from "@/types/socket.types.js";
import { messageService } from "@/services/message.service.js";
import { broadcastToUser } from "./active-users.js";

export const handleSocketMessage = async (ws: AuthenticatedWebSocket, rawData: any) => {
	try {
		const parsedData = JSON.parse(rawData.toString());
		const senderId = ws.user?.id;

		if (!senderId) {
			throw new Error("Unauthorized");
		}

		const payload = parsedData.payload || {};
		const messageText = String(payload.messageText || "").trim();
		const messageId = payload.messageId ? Number(payload.messageId) : null;
		const clientSideId = payload.clientSideId || null;
		let receiverId = payload.receiverId ? Number(payload.receiverId) : null;
		let responseData = null;

		switch (parsedData.type) {
			case "CREATE_MESSAGE": {
				if (!receiverId || isNaN(receiverId) || !messageText) throw new Error("Missing receiverId or messageText");
				if (senderId === receiverId) throw new Error("You cannot send a message to yourself");

				const newMessage = await messageService.createMessage(senderId, receiverId, messageText);
				responseData = { type: "NEW_MESSAGE", payload: { ...newMessage, clientSideId } };
				break;
			}
			case "UPDATE_MESSAGE": {
				if (!messageId || !messageText) throw new Error("Missing messageId or messageText");
				if (payload.isDeleted) return;

				const updatedMessage = await messageService.updateMessage(senderId, messageId, messageText);
				if (!updatedMessage) throw new Error("Message not found or unauthorized");

				receiverId = updatedMessage.receiverId || receiverId;
				responseData = { type: "MESSAGE_UPDATED", payload: updatedMessage };
				break;
			}
			case "DELETE_MESSAGE": {
				if (!messageId) {
					throw new Error("Missing messageId");
				}
				if (payload.isDeleted) {
					return;
				}

				const deletedMessage = await messageService.deleteMessage(senderId, messageId);
				if (!deletedMessage) {
					throw new Error("Message not found or unauthorized");
				}

				responseData = { type: "MESSAGE_DELETED", payload: { messageId, success: true } };
				break;
			}
			case "MARK_AS_READ": {
				if (!receiverId || isNaN(receiverId)) {
					throw new Error("Missing receiverId");
				}

				await messageService.isReadMessage(senderId, receiverId);
				responseData = { type: "MESSAGES_READ", payload: { readerId: senderId, partnerId: receiverId } };
				break;
			}
			default:
				throw new Error(`Unknown message type: ${parsedData.type}`);
		}

		if (responseData) {
			if (receiverId) {
				broadcastToUser(receiverId, responseData);
			}
			broadcastToUser(senderId, responseData);
		}
	} catch (e: any) {
		console.error("Error handling socket message:", e);
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: "ERROR", message: e.message || "Internal server error" }));
		}
	}
};
