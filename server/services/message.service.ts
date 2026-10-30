import db, { sequelize } from "@/models/index.js";
import { Op, QueryTypes } from "sequelize";


export const messageService = {
	getMessage: async (senderId: number, receiverId: number, limit: number, offset = 0) => {
		return await db.Message.findAll({
			where: {
				[Op.or]: [
					{senderId, receiverId},
					{senderId: receiverId, receiverId: senderId}
				]
			},
			limit,
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

	createMessage: async (senderId: number, receiverId: number, messageText: string) => {
		return await db.Message.create({
			senderId,
			receiverId,
			messageText,
			isRead: false
		});
	},
};