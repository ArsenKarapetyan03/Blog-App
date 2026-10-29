import db from "@/models/index.js";


export const messageService = {
	getMessage: async (userId: number) => {
		return await db.Message.findAndCountAll({
			where: {senderId: userId}
		})
	}
};