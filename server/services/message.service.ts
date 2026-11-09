import db, { sequelize } from "@/models/index.js";
import { Op, QueryTypes } from "sequelize";

export const messageService = {
	getMessages: async (chatId: number, offset: number) => {
		return await db.Message.findAll({
			where: { chatId },
			limit: 10,
			offset,
			order: [['createdAt', 'DESC']]
		});
	},

	getChatsWithLastMessage: async (currentUserId: number) => {
		const query = `
    WITH ranked_messages AS (
      SELECT
          to_jsonb(m.*) AS "lastMessage",
          m."createdAt",
        CASE 
          WHEN "senderId" = :currentUserId THEN "receiverId"
          ELSE "senderId"
        END AS partner_id,
        ROW_NUMBER() OVER(
          PARTITION BY CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END
          ORDER BY "createdAt" DESC, id DESC
        ) as rn
      FROM "Messages" m
      WHERE m."senderId" = :currentUserId OR m."receiverId" = :currentUserId
    )
    SELECT 
      json_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email
      ) AS "chatPartner",
      rm."lastMessage"
    FROM ranked_messages rm
    JOIN "Users" u ON u.id = rm.partner_id
    WHERE rm.rn = 1
    ORDER BY rm."createdAt" DESC;
  `;

		return await sequelize.query(query, {
			replacements: {currentUserId},
			type: QueryTypes.SELECT,
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

	isReadMessage: async (senderId: number, receiverId: number) => {
		const [affectedCount] = await db.Message.update(
			{ isRead: true },
			{
				where: {
					senderId: receiverId,
					chatId: senderId,
					isRead: false
				},
			}
		);

		return affectedCount;
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
			return null;
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