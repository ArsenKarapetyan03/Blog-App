import { chatService } from "@/services/chat.service.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
export const getChats = async (req, res) => {
    const userId = res.locals.user.id;
    const chatList = await chatService.getChats(userId);
    res.status(200).json({
        success: true,
        count: chatList.length,
        data: chatList,
    });
};
export const createChat = async (req, res) => {
    const creatorId = res.locals.user.id;
    const { participantIds, isGroup, title } = req.body;
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        throw new AppError("Validation Error: 'participantIds' must be a non-empty array of user IDs", 400);
    }
    const uniqueParticipantIds = Array.from(new Set(participantIds))
        .map(Number)
        .filter((id) => id !== creatorId && !isNaN(id));
    if (uniqueParticipantIds.length === 0) {
        throw new AppError("Validation Error: You must invite at least one other valid user", 400);
    }
    if (isGroup) {
        const newGroupChat = await chatService.createGroupChat(creatorId, title ? title.trim() : null, uniqueParticipantIds);
        return res.status(201).json({
            success: true,
            data: {
                id: newGroupChat.id,
                name: newGroupChat.name,
                isGroup: true,
                users: newGroupChat.users || [],
                createdAt: newGroupChat.createdAt,
            },
        });
    }
    else {
        const targetUserId = uniqueParticipantIds[0];
        const personalChat = await chatService.findOrCreate1to1Chat(creatorId, targetUserId);
        return res.status(200).json({
            success: true,
            data: {
                id: personalChat.id,
                name: personalChat.name,
                isGroup: false,
                users: personalChat.users || [],
                createdAt: personalChat.createdAt,
            },
        });
    }
};
//# sourceMappingURL=chat.controller.js.map