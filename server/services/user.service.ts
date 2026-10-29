import bcrypt from "bcrypt";
import db from "@/models/index.js";
import type { User } from "@/models/user.js";
import { Op } from "sequelize";

interface PendingRequestsResult {
	incomingRequests: User[];
	outgoingRequests: User[];
}

export const userService = {
	findAll: async (searchString: string, limit: number, offset: number) =>
		await db.User.findAndCountAll({
			where: {
				...searchString ? {
					name: {[Op.iLike]: `%${searchString}%`}
				} : {}
			},
			attributes: ["id", "name", "email"],
			limit,
			offset
		}),

	findByEmail: async (email: string) => {
		return await db.User.findOne({ where: { email } });
	},

	findById: async (id: number) => {
		return await db.User.findByPk(id, {
			attributes: ["id", "name", "email"],
			include: [
				{
					model: db.User,
					as: "FriendsAsRequester",
					attributes: ["id", "name", "email"],
				},
				{
					model: db.User,
					as: "FriendsAsReceiver",
					attributes: ["id", "name", "email"],
				}
			]
		});
	},

	findPendingRequests: async (userId: number): Promise<PendingRequestsResult> => {
		const user = await db.User.findByPk(userId, {
			include: [
				{
					model: db.User,
					as: "IncomingRequests",
					attributes: ["id", "name", "email"],
				},
				{
					model: db.User,
					as: "OutgoingRequests",
					attributes: ["id", "name", "email"],
				}
			]
		});

		return {
			incomingRequests: user?.IncomingRequests || [],
			outgoingRequests: user?.OutgoingRequests || [],
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