import bcrypt from "bcrypt";
import { Op } from "sequelize";
import db from "@/models/index.js";

export const userService = {
	findAll: async () => {
		return await db.User.findAll({
			attributes: ["id", "name", "email"],
		});
	},

	findByEmail: async (email: string) => {
		return await db.User.findOne({ where: { email } });
	},

	findById: async (id: number) => {
		return await db.User.findByPk(id, {
			attributes: ["id", "name", "email"],
			include: [
				{
					model: db.User,
					as: "InitiatedFriends",
					attributes: ["id", "name", "email"],
				},
				{
					model: db.User,
					as: "ReceivedFriends",
					attributes: ["id", "name", "email"],
				}
			]
		});
	},

	findPendingRequests: async (userId: number) => {
		const requests = await db.Friendship.findAll({
			attributes: ["userId", "friendId", "senderId"],
			where: {
				status: "pending",
				[Op.or]: [{ userId }, { friendId: userId }],
			},
		});
		const incomingIds: number[] = [];
		const outgoingIds: number[] = [];

		for (const request of requests) {
			const otherUserId = request.userId === userId ? request.friendId : request.userId;
			(request.senderId === userId ? outgoingIds : incomingIds).push(otherUserId);
		}

		const users = await db.User.findAll({
			where: { id: { [Op.in]: [...incomingIds, ...outgoingIds] } },
			attributes: ["id", "name", "email"],
		});
		const usersById = new Map(users.map(user => [user.id, user]));

		return {
			incomingRequests: incomingIds.map(id => usersById.get(id)).filter(Boolean),
			outgoingRequests: outgoingIds.map(id => usersById.get(id)).filter(Boolean),
		};
	},

	createUser: async (userData: any) => {
		const {name, email, password} = userData;
		const hashedPassword = await bcrypt.hash(password, 10);

		return await db.User.create({
			name,
			email,
			password: hashedPassword
		});
	}
};