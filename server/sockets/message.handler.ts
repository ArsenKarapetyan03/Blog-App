import { type AuthenticatedWebSocket } from "@/types/socket.types.js";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { broadcastToUser } from "./active-users.js";
import { catchAsyncWs } from "@/utils/ErrorHandlers/ws.error.js";

const socketMessageHandler = async (ws: AuthenticatedWebSocket, rawData: any) => {
	const parsedData = JSON.parse(rawData.toString());
	const senderId = ws.user?.id;

	if (!senderId) {
		throw new AppError("Unauthorized", 401);
	}

	if (!parsedData.type) {
		throw new AppError("Message type is required", 400);
	}

	const payload = parsedData.payload || {};
	const messageText = String(payload.messageText || "").trim();
	const messageId = payload.messageId ? Number(payload.messageId) : null;
	const clientSideId = payload.clientSideId || null;
	let receiverId = payload.receiverId ? Number(payload.receiverId) : null;
	let responseData = null;

	switch (parsedData.type) {
		case "CREATE_MESSAGE": {
			if (!receiverId || isNaN(receiverId) || !messageText) {
				throw new AppError("Missing receiverId or messageText", 400);
			}
			if (senderId === receiverId) {
				throw new AppError("You cannot send a message to yourself", 400);
			}

			const newMessage = await messageService.createMessage(senderId, receiverId, messageText);
			responseData = {type: "NEW_MESSAGE", payload: {...newMessage, clientSideId}};
			break;
		}
		case "UPDATE_MESSAGE": {
			if (!messageId || !messageText) {
				throw new AppError("Missing messageId or messageText", 400);
			}
			if (payload.isDeleted) {
				return;
			}

			const updatedMessage = await messageService.updateMessage(senderId, messageId, messageText);
			if (!updatedMessage) {
				throw new AppError("Message not found or unauthorized to update", 404);
			}

			receiverId = updatedMessage.receiverId || receiverId;
			responseData = {type: "MESSAGE_UPDATED", payload: updatedMessage};
			break;
		}
		case "DELETE_MESSAGE": {
			if (!messageId) {
				throw new AppError("Missing messageId", 400);
			}
			if (payload.isDeleted) {
				return;
			}

			const deletedMessage = await messageService.deleteMessage(senderId, messageId);
			if (!deletedMessage) {
				throw new AppError("Message not found or unauthorized", 404);
			}

			responseData = {type: "MESSAGE_DELETED", payload: {messageId, success: true}};
			break;
		}
		case "MARK_AS_READ": {
			if (!receiverId || isNaN(receiverId)) {
				throw new AppError("Missing receiverId", 400);
			}

			await messageService.isReadMessage(senderId, receiverId);
			responseData = {type: "MESSAGES_READ", payload: {readerId: senderId, partnerId: receiverId}};
			break;
		}
		case "TYPING_START": {
			receiverId = payload.receiverId ? Number(payload.receiverId) : null;
			if (!receiverId || isNaN(receiverId)) {
				throw new AppError("Missing or invalid receiverId for typing status", 400);
			}

			responseData = { type: "TYPING_STATUS", payload: { senderId, isTyping: true } };
			break;
		}
		case "TYPING_END": {
			receiverId = payload.receiverId ? Number(payload.receiverId) : null;
			if (!receiverId || isNaN(receiverId)) {
				throw new AppError("Missing or invalid receiverId for typing status", 400);
			}

			responseData = { type: "TYPING_STATUS", payload: { senderId, isTyping: false } };
			break;
		}
		default:
			throw new AppError(`Message type '${parsedData.type}' is not recognized.`, 400);
	}

	if (responseData) {
		if (receiverId) {
			broadcastToUser(receiverId, responseData);
		}
		broadcastToUser(senderId, responseData);
	}
};

export const handleSocketMessage = catchAsyncWs(socketMessageHandler);