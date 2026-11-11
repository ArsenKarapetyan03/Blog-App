import db, { sequelize } from "@/models/index.js";
import { Op } from "sequelize";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

export const messageService = {
	getMessages: async (userId: number, chatId: number, offset: number) => {
		const hasAccess = await db.ChatMember.findOne({
			where: { userId, chatId }
		});

		if (!hasAccess) {
			throw new AppError("Access denied", 404);
		}

		return await db.Message.findAll({
			where: { chatId },
			limit: 10,
			offset,
			order: [['createdAt', 'DESC']]
		});
	},

	createMessage: async (senderId: number, chatId: number, messageText: string) => {
		const newMessage =  await db.Message.create({
			senderId,
			chatId,
			messageText,
			isRead: false
		});

		return newMessage.toJSON();
	},

	markMessagesAsRead: async (userId: number, chatId: number) => {
		return await sequelize.transaction(async (transaction) => {
			const membership = await db.ChatMember.findOne({
				where: { userId, chatId },
				transaction,
			});

			if (!membership) {
				throw new AppError("Unauthorized", 404);
			}

			const readAt = new Date();
			await membership.update({ lastReadAt: readAt }, { transaction });
			await db.Message.update(
				{ isRead: true },
				{
					where: {
						chatId,
						senderId: { [Op.ne]: userId },
						isRead: false,
					},
					transaction,
				}
			);

			return readAt;
		});
	},

	updateMessage: async (senderId: number, messageId: number, messageText: string) => {
		const [affectedCount, updatedRows]  = await db.Message.update(
			{ messageText },
			{
				where: {
					id: messageId,
					senderId,
				},
				returning: true,
			}
		);

		if (!updatedRows?.[0]) {
			throw new AppError("Not found", 404);
		}

		return updatedRows[0].get({ plain: true });
	},

	deleteMessage: async (senderId: number, messageId: number) => {
		const [affectedCount, updatedRows] = await db.Message.update(
			{messageText: "Deleted message", isDeleted: true},
			{
				where: {
					id: messageId,
					senderId
				},
				returning: true,
			});

		return updatedRows?.[0]?.get({ plain: true }) || null;
	}
};