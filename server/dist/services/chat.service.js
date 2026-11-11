import { Op } from "sequelize";
import db, { sequelize } from "@/models/index.js";
export const chatService = {
    getChats: async (userId) => {
        const myMemberships = await db.ChatMember.findAll({
            where: { userId },
            attributes: ["chatId", "lastReadAt"],
        });
        if (myMemberships.length === 0) {
            return [];
        }
        const chatMap = new Map(myMemberships.map(m => [m.chatId, m.lastReadAt]));
        const chatIds = Array.from(chatMap.keys());
        const chats = await db.Chat.findAll({
            where: { id: { [Op.in]: chatIds } },
            include: [
                {
                    model: db.User,
                    as: "users",
                    attributes: ["id", "name", "email"],
                    through: { attributes: [] },
                },
                {
                    model: db.Message,
                    as: "messages",
                    required: false,
                },
            ],
            order: [
                [{ model: db.Message, as: "messages" }, "createdAt", "DESC"]
            ]
        });
        const formattedChats = chats.map((chat) => {
            const lastReadAt = chatMap.get(chat.id) || new Date(0);
            const allMessages = chat.messages || [];
            const lastMessageInstance = allMessages[0] || null;
            const unreadCount = allMessages.filter(msg => new Date(msg.createdAt) > new Date(lastReadAt) && msg.senderId !== userId).length;
            const chatUsers = chat.users || [];
            const displayTitle = chat.isGroup
                ? chat.title
                : (chatUsers.find(u => u.id !== userId)?.name || "Chat");
            return {
                id: chat.id,
                title: displayTitle,
                isGroup: chat.isGroup,
                unreadCount,
                users: chatUsers,
                lastMessage: lastMessageInstance ? {
                    id: lastMessageInstance.id,
                    messageText: lastMessageInstance.messageText,
                    createdAt: lastMessageInstance.createdAt,
                    senderId: lastMessageInstance.senderId,
                    isRead: new Date(lastMessageInstance.createdAt) <= new Date(lastReadAt)
                } : null,
                updatedAt: lastMessageInstance ? lastMessageInstance.createdAt : chat.updatedAt
            };
        });
        return formattedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    getChat: async (chatId) => {
        const chat = await db.Chat.findByPk(chatId, {
            include: [
                {
                    model: db.User,
                    as: "users",
                    attributes: ["id", "name", "email"],
                    through: { attributes: [] },
                },
                {
                    model: db.ChatMember,
                    as: "memberships",
                    attributes: ["userId", "lastReadAt"]
                }
            ]
        });
        if (!chat) {
            return null;
        }
        const users = chat.users.map(user => user.toJSON());
        const chatJson = chat.toJSON();
        return {
            id: chatJson.id,
            name: chatJson.title,
            isGroup: chatJson.isGroup,
            users,
            createdAt: chatJson.createdAt,
            updatedAt: chatJson.updatedAt
        };
    },
    createGroupChat: async (creatorId, title, participantIds) => {
        return await sequelize.transaction(async (t) => {
            const groupChat = await db.Chat.create({ title, isGroup: true }, { transaction: t });
            const membersData = [
                { chatId: groupChat.id, userId: creatorId, role: "admin" },
                ...participantIds.map(userId => ({ chatId: groupChat.id, userId, role: "member" }))
            ];
            await db.ChatMember.bulkCreate(membersData, { transaction: t });
            const fullChat = await db.Chat.findByPk(groupChat.id, {
                include: [{ model: db.User, as: "users", attributes: ["id", "name", "email"], through: { attributes: [] } }],
                transaction: t
            });
            const chatJson = fullChat.toJSON();
            return {
                id: chatJson.id,
                title: chatJson.title,
                isGroup: true,
                users: chatJson.users || [],
                createdAt: chatJson.createdAt
            };
        });
    },
    findOrCreate1to1Chat: async (creatorId, targetUserId) => {
        const memberRecords = await db.ChatMember.findAll({
            where: {
                userId: { [Op.in]: [creatorId, targetUserId] }
            },
            attributes: ["chatId"],
            include: [
                {
                    model: db.Chat,
                    as: "chat",
                    where: { isGroup: false },
                    attributes: []
                }
            ],
            group: ["chatId"],
            having: sequelize.literal(`COUNT(DISTINCT "userId") = 2`),
            raw: true
        });
        const matchedChatId = memberRecords[0]?.chatId;
        if (matchedChatId) {
            const existingChat = await db.Chat.findByPk(matchedChatId, {
                include: [
                    {
                        model: db.User,
                        as: "users",
                        attributes: ["id", "name", "email"],
                        through: { attributes: [] }
                    }
                ]
            });
            const chatJson = existingChat.toJSON();
            return {
                id: chatJson.id,
                name: chatJson.users.find((u) => u.id !== creatorId)?.name || "Direct message",
                isGroup: false,
                users: chatJson.users || [],
                createdAt: chatJson.createdAt
            };
        }
        return await sequelize.transaction(async (t) => {
            const newChat = await db.Chat.create({ isGroup: false }, { transaction: t });
            await db.ChatMember.bulkCreate([
                { chatId: newChat.id, userId: creatorId, role: "member" },
                { chatId: newChat.id, userId: targetUserId, role: "member" }
            ], { transaction: t });
            const fullChat = await db.Chat.findByPk(newChat.id, {
                include: [{ model: db.User, as: "users", attributes: ["id", "name", "email"], through: { attributes: [] } }],
                transaction: t
            });
            const chatJson = fullChat.toJSON();
            return {
                id: chatJson.id,
                name: chatJson.users.find((u) => u.id !== creatorId)?.name || "Direct message",
                isGroup: false,
                users: chatJson.users || [],
                createdAt: chatJson.createdAt
            };
        });
    }
};
//# sourceMappingURL=chat.service.js.map