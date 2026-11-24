import db from "@/models/index.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";


export const productService = {
	getAllProducts: async () => {
		return await db.Product.findAll({
			where: {active: true},
			attributes: ["id", "name", "description"],
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
					required: false,
					attributes: ["id", "unitAmount", "currency", "type", "interval", "intervalCount"],
				},
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name", "email"],
				}
			],
			order: [["createdAt", "DESC"]],
		});
	},

	getProductById: async (productId: number) => {
		const product = await db.Product.findOne({
			where: {id: productId},
			attributes: {exclude: ["stripeProductId"]},
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
					required: false,
					attributes: {exclude: ["stripePriceId"]},
				},
			],
		});

		if (!product) {
			throw new AppError("Product not found", 404);
		}

		return product;
	},

	getUserProducts: async (userId: string | number) => {
		return await db.Product.findAll({
			where: {userId, active: true},
			attributes: ["id", "name", "description"],
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
					required: false,
					attributes: ["id", "unitAmount", "currency"],
				},
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name", "email"],
				},
			],
			order: [["createdAt", "DESC"]],
		});
	},
}