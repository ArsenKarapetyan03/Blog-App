import db from "@/models/index.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";
import { PLATFORM_FEE_RATE } from "@/config/config.js";
import { stripeService } from "@/services/stripe.service.js";
import { Op } from "sequelize";

interface GetOrders {
	searchString?: string;
	userId?: number | undefined;
	limit: number;
	offset: number;
}

export interface OrderStatusDTO {
	code: string;
	label: string;
}

export interface UpdatedOrderStatusDTO {
	id: number;
	Status: OrderStatusDTO;
}

export interface ShippedOrderDTO {
	id: number;
	Status: OrderStatusDTO;
}

const getOrder = async (orderId: number, userId: number) => {
	return await db.Order.findOne({
		where: { id: orderId, userId },
		include: [
			{
				model: db.OrderStatus,
				as: "Status",
				attributes: ["id", "code", "label"],
			},
			{
				model: db.OrderItem,
				as: "Items",
				attributes: ["id", "quantity", "unitAmount"],
				include: [
					{
						model: db.Price,
						as: "Price",
						attributes: ["id", "type"],
						include: [
							{
								model: db.Product,
								as: "Product",
								attributes: ["id", "userId"],
							},
						],
					},
				],
			},
		],
	});
};

export const orderService = {
	getUserOrders: async ({ userId, searchString, limit, offset }: GetOrders) => {
		const searchWhere = searchString
			? {
				[Op.or]: [
					{ '$Items.Price.Product.name$': { [Op.iLike]: `%${searchString}%` } },
					{ '$Items.Price.Product.description$': { [Op.iLike]: `%${searchString}%` } },
				],
			}
			: {};

		const { rows: orders, count } = await db.Order.findAndCountAll({
			where: {
				userId,
				...searchWhere,
			},
			attributes: ['id', 'totalAmount', 'currency', 'createdAt'],
			include: [
				{
					model: db.OrderStatus,
					as: 'Status',
					attributes: ['code', 'label'],
				},
				{
					model: db.OrderItem,
					as: 'Items',
					attributes: ['id', 'quantity', 'unitAmount'],
					include: [
						{
							model: db.Price,
							as: 'Price',
							attributes: ['id', 'type'],
							include: [
								{
									model: db.Product,
									as: 'Product',
									attributes: ['name', 'description'],
								},
							],
						},
					],
				},
			],
			order: [['createdAt', 'DESC']],
			limit,
			offset,
			distinct: true,
			subQuery: false,
		});


		return { orders: orders.map((order: any) => order.get({ plain: true })), count };
	},

	markAsShipped: async (orderId: number, userId: number): Promise<ShippedOrderDTO> => {
		const order = await getOrder(orderId, userId);

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		if (order.Status?.code !== "paid") {
			throw new AppError("Only paid orders can be marked as shipped", 400);
		}

		const shippedStatus = await db.OrderStatus.findOne({
			where: { code: "shipped" },
		});

		if (!shippedStatus) {
			throw new AppError("Shipped status not found", 500);
		}

		const sellerReleases = new Map<number, number>();
		for (const item of order.Items || []) {
			const sellerId = item.Price?.Product?.userId;
			if (sellerId) {
				const grossTotal = item.unitAmount * item.quantity;
				const netSellerAmount = Math.round(grossTotal * (1 - PLATFORM_FEE_RATE));
				sellerReleases.set(
					sellerId,
					(sellerReleases.get(sellerId) || 0) + netSellerAmount
				);
			}
		}

		await db.sequelize.transaction(async (transaction) => {
			await order.update({ statusId: shippedStatus.id }, { transaction });

			for (const [sellerId, amountToRelease] of sellerReleases.entries()) {
				const balance = await db.SellerBalance.findOne({
					where: { userId: sellerId },
					lock: transaction.LOCK.UPDATE,
					transaction,
				});

				if (!balance) {
					throw new AppError("Seller balance not found", 404);
				}

				if (balance.pendingAmount < amountToRelease) {
					throw new AppError("Insufficient pending balance to release funds", 400);
				}

				await balance.update(
					{
						pendingAmount: balance.pendingAmount - amountToRelease,
						availableAmount: balance.availableAmount + amountToRelease,
					},
					{ transaction }
				);
			}
		});

		return {
			id: order.id,
			Status: {
				code: shippedStatus.code,
				label: shippedStatus.label,
			},
		};
	},

	refundOrder: async (orderId: number, userId: number): Promise<UpdatedOrderStatusDTO> => {
		const order = await getOrder(orderId, userId);

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		const isSubscriptionOrder =
			Boolean(order.subscriptionId) ||
			Boolean(order.Items?.some((item) => item.Price?.type === "recurring"));

		if (isSubscriptionOrder) {
			throw new AppError("Subscription orders cannot be refunded.", 400);
		}

		const currentCode = order.Status?.code;
		if (currentCode !== "paid" && currentCode !== "shipped") {
			throw new AppError("Only paid or shipped orders can be refunded", 400);
		}

		if (!order.stripePaymentIntentId) {
			throw new AppError("No Stripe payment found for this order", 400);
		}

		const refundedStatus = await db.OrderStatus.findOne({
			where: { code: "refunded" },
		});

		if (!refundedStatus) {
			throw new AppError("Refunded status not found", 500);
		}

		const sellerDeductions = new Map<number, number>();
		for (const item of order.Items || []) {
			const sellerId = item.Price?.Product?.userId;
			if (sellerId) {
				const grossTotal = item.unitAmount * item.quantity;
				const netSellerAmount = Math.round(grossTotal * (1 - PLATFORM_FEE_RATE));
				sellerDeductions.set(
					sellerId,
					(sellerDeductions.get(sellerId) || 0) + netSellerAmount
				);
			}
		}

		for (const [sellerId, amountToDeduct] of sellerDeductions.entries()) {
			const balance = await db.SellerBalance.findOne({
				where: { userId: sellerId },
			});

			const totalBalance = (balance?.pendingAmount || 0) + (balance?.availableAmount || 0);

			if (!balance || totalBalance < amountToDeduct) {
				throw new AppError("Insufficient seller balance to process refund", 400);
			}
		}

		await stripeService.refundPayment(order.stripePaymentIntentId);

		await db.sequelize.transaction(async (transaction) => {
			await order.update(
				{ statusId: refundedStatus.id },
				{ transaction }
			);

			for (const [sellerId, amountToDeduct] of sellerDeductions.entries()) {
				const balance = await db.SellerBalance.findOne({
					where: { userId: sellerId },
					lock: transaction.LOCK.UPDATE,
					transaction,
				});

				if (!balance) {
					throw new AppError("Seller balance not found", 404);
				}

				const totalBalance = balance.pendingAmount + balance.availableAmount;
				if (totalBalance < amountToDeduct) {
					throw new AppError("Insufficient seller balance to process refund", 400);
				}

				const fromPending = Math.min(balance.pendingAmount, amountToDeduct);
				const remaining = amountToDeduct - fromPending;
				const fromAvailable = Math.min(balance.availableAmount, remaining);

				await balance.update(
					{
						pendingAmount: balance.pendingAmount - fromPending,
						availableAmount: balance.availableAmount - fromAvailable,
					},
					{ transaction }
				);
			}
		});

		return {
			id: order.id,
			Status: {
				code: refundedStatus.code,
				label: refundedStatus.label,
			},
		};
	},
};