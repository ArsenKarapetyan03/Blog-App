import { Op } from "sequelize";
import db, { sequelize } from "@/models/index.js";
import type { User } from "@/models/user.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

interface FormattedChat {
	id: number;
	title: string;
	isGroup: boolean;
	unreadCount: number;
	users: Partial<User>[];
	adminId: number | undefined;
	lastMessage: {
		id: number;
		messageText: string;
		createdAt: Date;
		senderId: number;
		isRead: boolean;
	} | null;
	updatedAt: Date;
}

interface ChatDetails {
	id: number;
	name: string | null;
	isGroup: boolean;
	users: User[];
	adminId: number | undefined;
	createdAt: Date;
	updatedAt: Date;
}

interface GroupChatResult {
	id: number;
	title: string | null;
	isGroup: boolean;
	users: User[];
	adminId: number;
	createdAt: Date;
}

interface DirectChatResult {
	id: number;
	name: string;
	isGroup: boolean;
	users: User[];
	createdAt: Date;
}

export const chatService = {
	getChats: async (userId: number) => {
		const myMemberships = await db.ChatMember.findAll({
			where: {userId},
			attributes: ["chatId", "lastReadAt"],
		});

		if (myMemberships.length === 0) {
			return [];
		}

		const chatMap = new Map(myMemberships.map(m => [m.chatId, m.lastReadAt]));
		const chatIds = Array.from(chatMap.keys());

		const chats = await db.Chat.findAll({
			where: {id: {[Op.in]: chatIds}},
			include: [
				{
					model: db.User,
					as: "users",
					attributes: ["id", "name", "email"],
					through: {attributes: []},
				},
				{
					model: db.Message,
					as: "messages",
					required: false,
				},
				{
					model: db.ChatMember,
					as: "memberships",
					attributes: ["userId", "role", "lastReadAt"]
				}
			],
			order: [
				[{model: db.Message, as: "messages"}, "createdAt", "DESC"]
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

			const adminId = chat.isGroup
				? (chat.memberships?.find(m => m.role === "admin")?.userId)
				: null;

			const displayTitle = chat.isGroup
				? chat.title
				: (chatUsers.find(u => u.id !== userId)?.name || "Chat");

			return {
				id: chat.id,
				title: displayTitle,
				isGroup: chat.isGroup,
				unreadCount,
				users: chatUsers,
				adminId,
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

		return formattedChats.sort((a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		) as FormattedChat[];
	},

	getChat: async (chatId: number): Promise<ChatDetails | null> => {
		const chat = await db.Chat.findByPk(chatId, {
			include: [
				{
					model: db.User,
					as: "users",
					attributes: ["id", "name", "email"],
					through: {attributes: []},
				},
				{
					model: db.ChatMember,
					as: "memberships",
					attributes: ["userId", "role", "lastReadAt"]
				}
			]
		});

		if (!chat) {
			return null;
		}

		return {
			id: chat.id,
			name: chat.title,
			isGroup: chat.isGroup,
			users: chat.users.map(user => user.toJSON()),
			adminId: chat.memberships.find(u => u.role === "admin")?.userId,
			createdAt: chat.createdAt,
			updatedAt: chat.updatedAt
		};
	},

	createGroupChat: async (creatorId: number, title: string, participantIds: number[]): Promise<GroupChatResult | null> => {
		return await sequelize.transaction(async (t) => {
			const groupChat = await db.Chat.create({title, isGroup: true}, {transaction: t});

			const membersData = [
				{chatId: groupChat.id, userId: creatorId, role: "admin"},
				...participantIds.map(userId => ({chatId: groupChat.id, userId, role: "member"}))
			];

			await db.ChatMember.bulkCreate(membersData, {transaction: t});

			const fullChat = await db.Chat.findByPk(groupChat.id, {
				include: [{model: db.User, as: "users", attributes: ["id", "name", "email"], through: {attributes: []}}],
				transaction: t
			});

			if (!fullChat) {
				return null;
			}

			return {
				id: fullChat.id,
				title: fullChat.title,
				isGroup: true,
				users: fullChat.users || [],
				adminId: creatorId,
				createdAt: fullChat.createdAt
			};
		});
	},

	updateGroupChat: async (adminId: number, chatId: number, title: string) => {
		return await sequelize.transaction(async (t) => {
			const chat = await db.Chat.findOne({
				where: {id: chatId, isGroup: true},
				transaction: t,
			});

			if (!chat) {
				throw new AppError("Group chat not found.", 404);
			}

			const membership = await db.ChatMember.findOne({
				where: {
					chatId,
					userId: adminId,
					role: "admin",
				},
				transaction: t,
			});

			if (!membership) {
				throw new AppError("Unauthorized: Only group admins can update this chat.", 403);
			}

			await chat.update({title}, {transaction: t});

			return chat;
		})
	},

	findOrCreate1to1Chat: async (creatorId: number, targetUserId: number): Promise<DirectChatResult | null> => {
		const memberRecords = await db.ChatMember.findAll({
			where: {
				userId: {[Op.in]: [creatorId, targetUserId]}
			},
			attributes: ["chatId"],
			include: [
				{
					model: db.Chat,
					as: "chat",
					where: {isGroup: false},
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
						through: {attributes: []}
					}
				]
			});

			if (!existingChat) {
				return null;
			}

			return {
				id: existingChat.id,
				name: existingChat.users.find((u: any) => u.id !== creatorId)?.name || "Direct message",
				isGroup: false,
				users: existingChat.users || [],
				createdAt: existingChat.createdAt
			};
		}

		return await sequelize.transaction(async (t) => {
			const newChat = await db.Chat.create({isGroup: false}, {transaction: t});

			await db.ChatMember.bulkCreate([
				{chatId: newChat.id, userId: creatorId, role: "member"},
				{chatId: newChat.id, userId: targetUserId, role: "member"}
			], {transaction: t});

			const fullChat = await db.Chat.findByPk(newChat.id, {
				include: [{model: db.User, as: "users", attributes: ["id", "name", "email"], through: {attributes: []}}],
				transaction: t
			});

			if (!fullChat) {
				return null;
			}

			return {
				id: fullChat.id,
				name: fullChat.users.find((u: any) => u.id !== creatorId)?.name || "Direct message",
				isGroup: false,
				users: fullChat.users || [],
				createdAt: fullChat.createdAt
			};
		});
	},

	addChatMembers: async (adminId: number, chatId: number, memberIds: number[]) => {
		return await sequelize.transaction(async (t) => {
			if (!memberIds || memberIds.length === 0) {
				throw new AppError("At least one member ID must be provided", 400);
			}

			const uniqueMemberIds = [...new Set(memberIds)];

			const chat = await db.Chat.findByPk(chatId);
			if (!chat) {
				throw new AppError("Chat not found", 404);
			}

			if (!chat.isGroup) {
				throw new AppError("Cannot add members to a private 1-on-1 chat", 403);
			}

			const adminMembership = await db.ChatMember.findOne({
				where: {chatId, userId: adminId},
			});

			if (!adminMembership || adminMembership.role !== "admin") {
				throw new AppError("Only chat admins can add members", 403);
			}

			const existingUsers = await db.User.findAll({
				where: {id: uniqueMemberIds},
			});

			if (existingUsers.length !== uniqueMemberIds.length) {
				throw new AppError("One or more users were not found", 404);
			}

			const existingMemberships = await db.ChatMember.findAll({
				where: {
					chatId,
					userId: uniqueMemberIds,
				},
			});

			if (existingMemberships.length > 0) {
				throw new AppError("One or more users are already members of this chat", 409);
			}

			const newMembersData = uniqueMemberIds.map((userId) => ({
				chatId,
				userId,
				role: "member",
			}));

			await db.ChatMember.bulkCreate(newMembersData, {transaction: t});

			return {
				chatId,
				addedUserIds: uniqueMemberIds,
			};
		});
	},

	deleteChatMember: async (adminId: number, memberId: number, chatId: number) => {
		return await sequelize.transaction(async (t) => {
			const chat = await db.Chat.findByPk(chatId);
			if (!chat) {
				throw new AppError("Chat not found", 404);
			}

			if (!chat.isGroup) {
				throw new AppError("Cannot remove members from a private 1-on-1 chat", 403);
			}

			const adminMembership = await db.ChatMember.findOne({
				where: {chatId, userId: adminId},
			});

			if (!adminMembership || adminMembership.role !== "admin") {
				throw new AppError("Only chat admins can remove members", 403);
			}

			if (adminId === memberId) {
				throw new AppError("Admins cannot remove themselves; use the leave chat action instead", 400);
			}

			const targetMembership = await db.ChatMember.findOne({
				where: {chatId, userId: memberId},
			});

			if (!targetMembership) {
				throw new AppError("User is not a member of this chat", 404);
			}

			if (targetMembership.role === "admin") {
				throw new AppError("Cannot remove another admin from the chat", 403);
			}

			await targetMembership.destroy({transaction: t});

			return {
				chatId,
				removedUserId: memberId,
			}
		});
	}
}