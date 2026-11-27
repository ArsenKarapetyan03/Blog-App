import db, { sequelize } from "@/models/index.js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import { PLATFORM_FEE_RATE } from "@/config/config.js";
import type { Transaction } from "sequelize";
import type { SubscriptionStatus } from "@/models/subscription.js";
import { AppError } from "@/utils/ErrorHandlers/app.error.js";

const statusMap = await db.OrderStatus.getStatusMap();

const extractPeriodDates = (stripeSub: Stripe.Subscription) => {
	const firstItem = stripeSub.items.data[0];
	const startUnix = firstItem?.current_period_start ?? stripeSub.start_date;
	const endUnix = firstItem?.current_period_end ?? stripeSub.start_date;

	return {
		currentPeriodStart: new Date(startUnix * 1000),
		currentPeriodEnd: new Date(endUnix * 1000),
	};
}

const extractSubscriptionIdFromInvoice = (invoice: Stripe.Invoice): string | null => {
	const sub = invoice.parent?.subscription_details?.subscription;
	if (!sub) {
		return null;
	}
	return typeof sub === "string" ? sub : sub.id;
}

export const calculateSellerEarningsByUser = async (orderId: number, transaction: Transaction): Promise<Map<number, number>> => {
	const items = await db.OrderItem.findAll({
		where: {orderId},
		include: [
			{
				model: db.Price,
				as: "Price",
				include: [
					{
						model: db.Product,
						as: "Product",
						attributes: ["id", "userId"],
					},
				],
			},
		],
		transaction,
	});

	const earningsBySeller = new Map<number, number>();

	for (const item of items) {
		const sellerId = item.Price?.Product?.userId;
		if (!sellerId) {
			continue;
		}

		const itemGrossAmount = item.unitAmount * item.quantity;
		const platformFee = Math.round(itemGrossAmount * PLATFORM_FEE_RATE);
		const sellerShare = itemGrossAmount - platformFee;

		if (sellerShare > 0) {
			earningsBySeller.set(
				sellerId,
				(earningsBySeller.get(sellerId) ?? 0) + sellerShare
			);
		}
	}

	return earningsBySeller;
};

export const creditSellersForOrder = async (orderId: number, currency: string, transaction: Transaction) => {
	const earningsBySeller = await calculateSellerEarningsByUser(orderId, transaction);

	for (const [sellerId, amountToCredit] of earningsBySeller.entries()) {
		const [sellerBalance] = await db.SellerBalance.findOrCreate({
			where: { userId: sellerId },
			defaults: {
				userId: sellerId,
				availableAmount: 0,
				pendingAmount: 0,
				currency,
			},
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		await sellerBalance.increment("pendingAmount", {
			by: amountToCredit,
			transaction,
		});
	}
};

export const fulfillOrderAndCreditSeller = async (session: Stripe.Checkout.Session) => {
	const orderId = Number(session.metadata?.orderId);
	if (!orderId) {
		return;
	}

	let paymentIntentId =
		typeof session.payment_intent === "string"
			? session.payment_intent
			: session.payment_intent?.id ?? null;

	const invoiceId =
		typeof session.invoice === "string"
			? session.invoice
			: session.invoice?.id ?? null;

	if (!paymentIntentId && invoiceId) {
		const fullInvoice = await stripe.invoices.retrieve(invoiceId, {
			expand: ["payments.data.payment.payment_intent"],
		});
		const firstPayment = fullInvoice.payments?.data[0]?.payment;
		const rawPi = firstPayment?.payment_intent;
		paymentIntentId = typeof rawPi === "string" ? rawPi : rawPi?.id ?? null;
	}

	await sequelize.transaction(async (transaction) => {
		const order = await db.Order.findOne({
			where: { id: orderId, statusId: statusMap.pending },
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (!order) {
			return;
		}

		await order.update(
			{
				statusId: statusMap.paid,
				stripeCheckoutSessionId: session.id,
				stripePaymentIntentId: paymentIntentId,
				...(invoiceId ? { stripeInvoiceId: invoiceId } : {}),
			},
			{ transaction }
		);

		await creditSellersForOrder(order.id, order.currency, transaction);
	});
};

export const updatePendingOrderStatus = async (session: Stripe.Checkout.Session, newStatusId: number) => {
	const orderId = Number(session.metadata?.orderId);
	if (!orderId) {
		return;
	}

	await db.Order.update(
		{ statusId: newStatusId },
		{ where: { id: orderId, statusId: statusMap.pending } }
	);
};

export const initializeSubscriptionFromCheckout = async (session: Stripe.Checkout.Session) => {
	if (!session.subscription) {
		return;
	}

	const stripeSubId =
		typeof session.subscription === "string"
			? session.subscription
			: session.subscription.id;

	const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
	const stripePriceId = stripeSub.items.data[0]?.price.id;
	const orderId = Number(session.metadata?.orderId);

	const [price, order] = await Promise.all([
		stripePriceId ? db.Price.findOne({ where: { stripePriceId } }) : null,
		orderId ? db.Order.findByPk(orderId) : null,
	]);

	const userId = order?.userId ?? Number(session.metadata?.userId);
	if (!price || !userId) {
		return;
	}

	const { currentPeriodStart, currentPeriodEnd } = extractPeriodDates(stripeSub);

	const [subscription] = await db.Subscription.upsert({
		userId,
		priceId: price.id,
		stripeSubscriptionId: stripeSub.id,
		status: stripeSub.status as SubscriptionStatus,
		currentPeriodStart,
		currentPeriodEnd,
		cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
		canceledAt: stripeSub.canceled_at
			? new Date(stripeSub.canceled_at * 1000)
			: null,
	});

	if (order) {
		const invoiceId =
			typeof session.invoice === "string"
				? session.invoice
				: session.invoice?.id ?? null;

		await order.update({
			subscriptionId: subscription.id,
			stripeInvoiceId: invoiceId,
		});
	}
};

export const handleSubscriptionInvoicePaid = async (invoice: Stripe.Invoice) => {
	const stripeSubId = extractSubscriptionIdFromInvoice(invoice);

	if (!stripeSubId || invoice.billing_reason === "subscription_create") {
		return;
	}

	const fullInvoice = await stripe.invoices.retrieve(invoice.id, {
		expand: ["payments.data.payment.payment_intent"],
	});

	const firstPayment = fullInvoice.payments?.data[0]?.payment;
	const rawPi = firstPayment?.payment_intent;
	const paymentIntentId = typeof rawPi === "string" ? rawPi : rawPi?.id ?? null;

	await sequelize.transaction(async (transaction) => {
		const existingOrder = await db.Order.findOne({
			where: { stripeInvoiceId: invoice.id },
			transaction,
		});

		if (existingOrder) {
			return;
		}

		const subscription = await db.Subscription.findOne({
			where: { stripeSubscriptionId: stripeSubId },
			include: [{ model: db.Price, as: "Price" }],
			lock: {
				level: transaction.LOCK.UPDATE,
				of: db.Subscription,
			},
			transaction,
		});

		if (!subscription || !subscription.Price) {
			throw new AppError(`Subscription not found for renewal invoice ${invoice.id}`, 404);
		}

		const renewalOrder = await db.Order.create(
			{
				userId: subscription.userId,
				subscriptionId: subscription.id,
				statusId: statusMap.paid,
				stripeInvoiceId: invoice.id,
				stripePaymentIntentId: paymentIntentId,
				totalAmount: invoice.amount_paid,
				currency: invoice.currency,
			},
			{ transaction }
		);

		await db.OrderItem.create(
			{
				orderId: renewalOrder.id,
				priceId: subscription.priceId,
				quantity: 1,
				unitAmount: invoice.amount_paid,
			},
			{ transaction }
		);

		const linePeriodEnd = invoice.lines?.data?.[0]?.period?.end;

		await subscription.update(
			{
				status: "active",
				...(linePeriodEnd && { currentPeriodEnd: new Date(linePeriodEnd * 1000) }),
			},
			{ transaction }
		);
		console.log("recurring renewed")
		await creditSellersForOrder(renewalOrder.id, invoice.currency, transaction);
	});
};

export const handleSubscriptionInvoiceFailed = async (invoice: Stripe.Invoice) => {
	const stripeSubId = extractSubscriptionIdFromInvoice(invoice);
	if (!stripeSubId) {
		return;
	}

	await db.Subscription.update(
		{ status: "past_due" },
		{ where: { stripeSubscriptionId: stripeSubId } }
	);
	console.warn(`Subscription invoice payment failed: ${invoice.id}`);
};

export const syncSubscriptionFromStripe = async (stripeSub: Stripe.Subscription) => {
	const stripePriceId = stripeSub.items.data[0]?.price.id;
	const price = stripePriceId
		? await db.Price.findOne({ where: { stripePriceId } })
		: null;

	const { currentPeriodStart, currentPeriodEnd } = extractPeriodDates(stripeSub);

	await db.Subscription.update(
		{
			...(price ? { priceId: price.id } : {}),
			status: stripeSub.status as SubscriptionStatus,
			currentPeriodStart,
			currentPeriodEnd,
			cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
			canceledAt: stripeSub.canceled_at
				? new Date(stripeSub.canceled_at * 1000)
				: null,
		},
		{ where: { stripeSubscriptionId: stripeSub.id } }
	);
};

export const handleChargeRefunded = async (charge: Stripe.Charge) => {
	const paymentIntentId =
		typeof charge.payment_intent === "string"
			? charge.payment_intent
			: charge.payment_intent?.id;

	if (!paymentIntentId) return;

	await sequelize.transaction(async (transaction) => {
		const order = await db.Order.findOne({
			where: { stripePaymentIntentId: paymentIntentId, statusId: statusMap.paid },
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (!order) return;

		await order.update({ statusId: statusMap.refunded }, { transaction });

		const deductionsBySeller = await calculateSellerEarningsByUser(order.id, transaction);

		for (const [sellerId, amountToDeduct] of deductionsBySeller.entries()) {
			const sellerBalance = await db.SellerBalance.findOne({
				where: { userId: sellerId },
				lock: transaction.LOCK.UPDATE,
				transaction,
			});

			if (!sellerBalance) continue;

			if (sellerBalance.pendingAmount >= amountToDeduct) {
				await sellerBalance.decrement("pendingAmount", {
					by: amountToDeduct,
					transaction,
				});
			} else {
				const remaining = amountToDeduct - sellerBalance.pendingAmount;
				await sellerBalance.update(
					{
						pendingAmount: 0,
						availableAmount: Math.max(0, sellerBalance.availableAmount - remaining),
					},
					{ transaction }
				);
			}
		}
	});
};