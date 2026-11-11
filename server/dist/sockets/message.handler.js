import {} from "@/types/socket.types.js";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { broadcastToUser } from "./active-users.js";
import { catchAsyncWs } from "@/utils/ErrorHandlers/ws.error.js";
import { chatService } from "@/services/chat.service.js";
const socketMessageHandler = async (ws, rawData) => {
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
    const chatId = payload.chatId ? Number(payload.chatId) : null;
    let responseData = null;
    if (!chatId || isNaN(chatId)) {
        throw new AppError("Valid chatId is required", 400);
    }
    const chat = await chatService.getChat(chatId);
    if (!chat) {
        throw new AppError("Chat not found", 404);
    }
    const isMember = chat.users?.some((user) => user.id === senderId);
    if (!isMember) {
        throw new AppError("You are not a member of this chat", 403);
    }
    switch (parsedData.type) {
        case "CREATE_MESSAGE": {
            if (!messageText) {
                throw new AppError("Missing messageText", 400);
            }
            const newMessage = await messageService.createMessage(senderId, chatId, messageText);
            responseData = { type: "NEW_MESSAGE", payload: { ...newMessage, clientSideId } };
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
            responseData = { type: "MESSAGE_UPDATED", payload: updatedMessage };
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
            responseData = { type: "MESSAGE_DELETED", payload: { messageId, success: true } };
            break;
        }
        case "MARK_AS_READ": {
            await messageService.markMessagesAsRead(senderId, chatId);
            responseData = { type: "MESSAGES_READ", payload: { readerId: senderId, chatId } };
            break;
        }
        case "TYPING_START": {
            responseData = { type: "TYPING_STATUS", payload: { senderId, chatId, isTyping: true } };
            break;
        }
        case "TYPING_END": {
            responseData = { type: "TYPING_STATUS", payload: { senderId, chatId, isTyping: false } };
            break;
        }
        default:
            throw new AppError(`Message type '${parsedData.type}' is not recognized.`, 400);
    }
    if (responseData) {
        chat.users?.forEach((user) => {
            broadcastToUser(user.id, responseData);
        });
    }
};
export const handleSocketMessage = catchAsyncWs(socketMessageHandler);
//# sourceMappingURL=message.handler.js.map