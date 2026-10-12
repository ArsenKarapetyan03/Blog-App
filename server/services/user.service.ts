import bcrypt from "bcrypt";
import db from "#models/index.js";

export const userService = {
	findByEmail: async (email: string) => {
		return await db.User.findOne({ where: { email } });
	},

	findById: async (id: number | string) => {
		return await db.User.findByPk(id);
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
