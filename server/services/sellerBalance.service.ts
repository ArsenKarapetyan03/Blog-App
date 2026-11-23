import db from "@/models/index.js";

export const sellerBalanceService = {
	getBalance: async (userId: number) => {
		return await db.SellerBalance.findAll({
			where: { userId },
			attributes: ["availableAmount", "pendingAmount", "currency"],
		})
	}
}