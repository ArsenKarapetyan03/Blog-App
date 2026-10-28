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
		const pendingFriendships = await db.Friendship.findAll({
			where: {
				status: "pending",
				[Op.or]: [{ userId }, { friendId: userId }]
			},
			include: [
				{
					model: db.User,
					as: "user",
					attributes: ["id", "name", "email"],
				},
				{
					model: db.User,
					as: "friend",
					attributes: ["id", "name", "email"],
				}
			]
		});

		const incomingRequests: any[] = [];
		const outgoingRequests: any[] = [];

		for (const friendship of pendingFriendships) {
			const friend = friendship.userId === userId ? friendship.friend : friendship.user;

			if (!friend) {
				continue;
			}

			if (friendship.senderId === userId) {
				outgoingRequests.push(friend);
			} else {
				incomingRequests.push(friend);
			}
		}

		return {
			incomingRequests,
			outgoingRequests
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