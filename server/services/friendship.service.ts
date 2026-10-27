import db from "@/models/index.js";
import { Op } from "sequelize";

export const friendshipService = {
	find: async function (userId: number, friendId: number) {
		const sortedUserId = Math.min(userId, friendId);
		const sortedFriendId = Math.max(userId, friendId);

		return await db.Friendship.findOne({
			where: {
				userId: sortedUserId,
				friendId: sortedFriendId,
			}
		});
	},

	create: async function (userId: number, friendId: number) {
		const result = await db.Friendship.create(
			{
				userId,
				friendId,
				senderId: userId,
				status: "pending",
			}
		);

		if (!result) {
			return { success: false,	message: "Failed to create friendship request" };
		}

		return { success: true, message: "Successfully created friendship request" };
	},

	updateStatus: async function (userId: number, friendId: number, status: string) {
		const sortedUserId = Math.min(userId, friendId);
		const sortedFriendId = Math.max(userId, friendId);

		const [affectedCount] = await db.Friendship.update(
			{	status },
			{
				where: {
					userId: sortedUserId,
					friendId: sortedFriendId,
				}
			});

		if (affectedCount === 0) {
			return { success: false, message: "Friendship request not found or not updated" };
		}

		return { success: true, message: "Successfully updated friendship status" };
	},

	delete: async function (userId: number, friendId: number) {
		const sortedUserId = Math.min(userId, friendId);
		const sortedFriendId = Math.max(userId, friendId);

		const affectedRows = await db.Friendship.destroy({
			where: {
				userId: sortedUserId,
				friendId: sortedFriendId
			}
		});

		if (affectedRows === 0) {
			return { success: false, message: "Friendship relation not found" };
		}

		return { success: true, message: "Successfully deleted friendship relation" };
	}
};