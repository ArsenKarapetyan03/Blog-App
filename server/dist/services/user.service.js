import bcrypt from "bcrypt";
import db from "#models/index.js";
export const userService = {
    findByEmail: async (email) => {
        return await db.User.findOne({ where: { email } });
    },
    findById: async (id) => {
        return await db.User.findByPk(id);
    },
    createUser: async (userData) => {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        return await db.User.create({
            name,
            email,
            password: hashedPassword
        });
    }
};
//# sourceMappingURL=user.service.js.map