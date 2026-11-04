import db from "@/models/index.js";
import { Op } from "sequelize";

export const friendshipService = {
	find: async function (userId: number, friendId: number) {
		return await db.Friendship.findOne({
			where: {
				[Op.or]: [
					{ requesterId: userId, receiverId: friendId },
					{ requesterId: friendId, receiverId: userId }
				]
			}
		});
	},

	create: async function (userId: number, friendId: number) {
		const result = await db.Friendship.create({
			requesterId: userId,
			receiverId: friendId,
			status: "pending",
		});

		if (!result) {
			return { success: false, message: "Failed to create friendship request" };
		}

		return { success: true, message: "Successfully created friendship request" };
	},

	updateStatus: async function (userId: number, friendId: number, status: string) {
		const [affectedCount] = await db.Friendship.update(
			{ status },
			{
				where: {
					[Op.or]: [
						{ requesterId: userId, receiverId: friendId },
						{ requesterId: friendId, receiverId: userId }
					]
				}
			}
		);

		if (affectedCount === 0) {
			return { success: false, message: "Friendship request not found or not updated" };
		}

		return { success: true, message: "Successfully updated friendship status" };
	},

	delete: async function (userId: number, friendId: number) {
		const affectedRows = await db.Friendship.destroy({
			where: {
				[Op.or]: [
					{ requesterId: userId, receiverId: friendId },
					{ requesterId: friendId, receiverId: userId }
				]
			}
		});

		if (affectedRows === 0) {
			return { success: false, message: "Friendship relation not found" };
		}

		return { success: true, message: "Successfully deleted friendship relation" };
	}
};