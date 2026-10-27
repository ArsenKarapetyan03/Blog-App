import bcrypt from "bcrypt";
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

	findById: async (id: number | string) => {
		return await db.User.findByPk(id, {
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