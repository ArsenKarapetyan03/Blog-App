import { Op } from "sequelize";
import db, { sequelize } from "@/models/index.js";

interface FormattedChat {
	id: number;
	title: string | undefined | null;
	isGroup: boolean;
	unreadCount: number;
	users: any[];
	lastMessage: {
		id: number;
		messageText: string;
		createdAt: Date;
		sender: any;
	} | null;
	updatedAt: Date;
}

export const chatService = {
	getChats: async (userId: number) => {
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
					include: [{ model: db.User, as: "sender", attributes: ["id", "name"] }],
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

			const unreadCount = allMessages.filter(msg =>
				new Date(msg.createdAt) > new Date(lastReadAt) && msg.senderId !== userId
			).length;

			const chatUsers = chat.users || [];
			const displayUsers = chat.isGroup
				? chatUsers
				: chatUsers.filter(u => u.id !== userId);

			return {
				id: chat.id,
				title: chat.isGroup ? chat.title : (displayUsers[0]?.name),
				isGroup: chat.isGroup,
				unreadCount,
				users: displayUsers,
				lastMessage: lastMessageInstance ? {
					id: lastMessageInstance.id,
					messageText: lastMessageInstance.messageText,
					createdAt: lastMessageInstance.createdAt,
					sender: lastMessageInstance.sender
				} : null,
				updatedAt: lastMessageInstance ? lastMessageInstance.createdAt : chat.updatedAt
			};
		});
		
		return formattedChats.sort((a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		) as FormattedChat[];
	},

	getChat: async (chatId: number) => {
		const chat = await db.Chat.findByPk(chatId, {
			include: [
				{
					model: db.User,
					as: "users",
					attributes: ["id", "name", "email"],
				},
				{
					model: db.ChatMember,
					as: "memberships",
					attributes: ["userId", "lastReadAt"]
				}
			]
		});

		const users = chat?.users.map(user => user.toJSON());

		return ({...chat?.toJSON(), users});
	},

	createGroupChat: async (creatorId: number, title: string, participantIds: number[]) => {
		return await sequelize.transaction(async (t) => {
			const groupChat = await db.Chat.create({title, isGroup: true}, {transaction: t});

			const membersData = [
				{chatId: groupChat.id, userId: creatorId, role: "admin"},
				...participantIds.map(userId => ({chatId: groupChat.id, userId, role: "member"}))
			];

			await db.ChatMember.bulkCreate(membersData, {transaction: t});
			return groupChat;
		});
	},
}
