import {} from "express";
import { messageService } from "@/services/message.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
export const getMessages = async (req, res) => {
    const userId = res.locals.user.id;
    const { chatId, offset } = req.query;
    if (chatId === undefined) {
        throw new AppError("Invalid data", 400);
    }
    const parsedChatId = Number(chatId);
    const parsedOffset = offset ? Number(offset) : 0;
    if (isNaN(parsedChatId)) {
        throw new AppError("Parameters must be valid numbers", 400);
    }
    const messages = await messageService.getMessages(parsedChatId, parsedOffset);
    res.status(200).json({ success: true, messages });
};
export const getChats = async (req, res) => {
    const userId = res.locals.user.id;
    const data = await messageService.getChatsWithLastMessage(userId);
    res.status(200).json({ success: true, data });
};
export const readMessage = async (req, res) => {
    const currentUserId = res.locals.user.id;
    const chatId = Number(req.body?.chatId);
    if (!Number.isInteger(chatId) || chatId <= 0) {
        throw new AppError("Invalid chat ID", 400);
    }
    const readAt = await messageService.markMessagesAsRead(currentUserId, chatId);
    if (!readAt) {
        throw new AppError("You are not a member of this chat", 403);
    }
    res.status(200).json({ success: true, readAt });
};
//# sourceMappingURL=message.controller.js.map