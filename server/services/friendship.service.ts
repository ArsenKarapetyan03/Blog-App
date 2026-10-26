import db from "@/models/index.js";

export const friendshipService = {
	find: async function (userId: number, friendId: number) {
		return await db.Friendship.findOne({
			where: {
				userId,
				friendId
			}
		});
	},

	create: async function (userId, friendId) {
		const result = await db.Friendship.create(
			{
				userId,
				friendId,
				status: "pending",
			}
		);

		if (!result) {
			return { success: false,	message: "Failed to create friendship request" };
		}

		return { success: true, message: "Successfully created friendship request" };
	},

	update: async function (userId, friendId, status) {
		const [affectedCount] = await db.Friendship.update({
				userId,
				friendId,
				status,
			},
			{
				where: {
					userId,
					friendId
				}
			});

		if (affectedCount === 0) {
			return { success: false, message: "Friendship request not found or not updated" };
		}

		return { success: true, message: "Successfully updated friendship status" };
	},

	getFriendsList: async function (userId: number) {
		const friendships = await Friendship.findAll({
			where: {
				status: "accepted",
				[Op.or]: [
					{ userId },
					{ friendId: userId }
				]
			}
		});

		const friendIds = friendships.map(f => f.userId === currentUserId ? f.friendId : f.userId);

		if (friendIds.length === 0) return [];

		return await User.findAll({
			where: { id: { [Op.in]: friendIds } },
			attributes: ["id", "name", "email"]
		});
	}
}