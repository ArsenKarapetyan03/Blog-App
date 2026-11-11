import bcrypt from "bcrypt";
import db from "@/models/index.js";
import { Op } from "sequelize";
export const userService = {
    findAll: async (searchString, limit, offset, currentUserId) => await db.User.findAndCountAll({
        where: {
            ...currentUserId ? { id: { [Op.ne]: currentUserId } } : {},
            ...searchString ? {
                name: { [Op.iLike]: `%${searchString}%` }
            } : {}
        },
        attributes: ["id", "name", "email"],
        limit,
        offset
    }),
    findByEmail: async (email) => {
        return await db.User.findOne({ where: { email } });
    },
    findById: async (id) => {
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
    findPendingRequests: async (userId) => {
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