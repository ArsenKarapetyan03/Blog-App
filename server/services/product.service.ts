import db from "@/models/index.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { Op } from "sequelize";

interface GetOrders {
	searchString?: string;
	limit: number;
	offset: number;
}

export const productService = {
	getAllProducts: async ({searchString, limit, offset}: GetOrders) => {
		const searchWhere = searchString
			? {
				[Op.or]: [
					{name: {[Op.iLike]: `%${searchString}%`}},
					{description: {[Op.iLike]: `%${searchString}%`}},
				],
			}
			: {};

		const {rows: products, count} = await db.Product.findAndCountAll({
			where: {
				active: true,
				...searchWhere,
			},
			attributes: {exclude: ["stripeProductId"]},
			include: [
				{
					model: db.Price,
					as: "Prices",
					where: {active: true},
					required: true,
					attributes: ["id", "unitAmount", "currency", "type", "interval", "intervalCount"],
				},
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name", "email"],
				},
			],
			limit,
			offset,
			distinct: true,
			order: [["createdAt", "DESC"]],
		});

		return {products, count};
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
				{
					model: db.User,
					as: "Seller",
					attributes: ["id", "name"],
				}
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