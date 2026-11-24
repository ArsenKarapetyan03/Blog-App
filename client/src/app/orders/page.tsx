"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrders, markOrderAsShipped, refundOrder } from "@/actions/order";
import { useCart } from "@/context/CartContext";
import { Modal } from "antd";
import { useNotification } from "@/context/NotificationProvider";
import { Order } from "@/types/types";

const CheckoutSuccessHandler: React.FC = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { clearCart } = useCart();
	const notification = useNotification();
	const hasHandled = useRef(false);

	useEffect(() => {
		const orderId = searchParams.get("orderId");

		if (orderId && !hasHandled.current) {
			hasHandled.current = true;

			if (sessionStorage.getItem("checkout_source") === "cart") {
				clearCart();
				sessionStorage.removeItem("checkout_source");
			}

			notification.success({
				title: "Payment Successful",
				description: `Order #${orderId} has been placed.`,
				placement: "topRight",
			});

			router.replace("/orders", { scroll: false });
		}
	}, [searchParams, clearCart, notification, router]);

	return null;
};

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-yellow-100 text-yellow-800",
	paid: "bg-green-100 text-green-800",
	shipped: "bg-blue-100 text-blue-800",
	refunded: "bg-purple-100 text-purple-800",
	failed: "bg-red-100 text-red-800",
	cancelled: "bg-gray-100 text-gray-800",
};

const OrdersPage = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingId, setUpdatingId] = useState<number | null>(null);

	const notification = useNotification();

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setLoading(true);
				const response = await getOrders();
				const oneTimeOrders = (response?.data ?? []).filter(
					(order: Order) =>
						!order.Items?.some((item) => item.Price?.type === "recurring")
				);
				setOrders(oneTimeOrders);
			} catch (error) {
				console.warn("Failed to fetch orders:", error);
				setOrders([]);
				notification.error({
					title: "Failed to Load Orders",
					description: "Could not retrieve your order history. Please refresh the page.",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [notification]);

	const handleStatusChange = async (
		orderId: number,
		nextCode: "shipped" | "refunded"
	) => {
		try {
			setUpdatingId(orderId);

			const res =
				nextCode === "shipped"
					? await markOrderAsShipped(orderId)
					: await refundOrder(orderId);

			if (!res.success) {
				notification.error({
					title: "Update Failed",
					description: res.message || `Could not mark order #${orderId} as ${nextCode}.`,
				});
				return;
			}

			const nextLabel = nextCode === "shipped" ? "Shipped" : "Refunded";

			setOrders((prevOrders) =>
				prevOrders.map((order) =>
					order.id === orderId
						? {...order, Status: {code: nextCode, label: nextLabel}}
						: order
				)
			);

			notification.success({
				title: `Order ${nextLabel}`,
				description: `Order #${orderId} has been successfully marked as ${nextCode}.`,
			});
		} catch (error) {
			console.error(`Failed to mark order as ${nextCode}:`, error);
			notification.error({
				title: "Unexpected Error",
				description: `Something went wrong while updating Order #${orderId}.`,
			});
		} finally {
			setUpdatingId(null);
		}
	};

	const showRefundConfirm = (orderId: number) => {
		Modal.confirm({
			title: `Refund Order #${orderId}?`,
			content: "Are you sure you want to refund this order? This action cannot be undone.",
			okText: "Confirm Refund",
			cancelText: "Cancel",
			okType: "danger",
			centered: true,
			async onOk() {
				await handleStatusChange(orderId, "refunded");
			},
		});
	};

	const formatMoney = (amountInCents: number, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amountInCents / 100);
	};

	const formatDate = (isoString: string) => {
		return new Date(isoString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<>
			<Suspense fallback={null}>
				<CheckoutSuccessHandler />
			</Suspense>

			{loading ?
					<div className="w-full p-6">
						<p className="text-gray-500">Loading your orders...</p>
					</div>
				 : <div className="w-full p-6">
					{orders.length === 0 ? (
						<p className="text-gray-500">No orders found.</p>
					) : (
						<div className="space-y-6">
							{orders.map((order) => {
								const statusCode = order.Status?.code || "unknown";
								const badgeStyle =
									STATUS_STYLES[statusCode] || "bg-gray-100 text-gray-800";
								const isUpdating = updatingId === order.id;

								return (
									<div
										key={order.id}
										className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
									>
										<div
											className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
											<div className="flex gap-6 text-sm">
												<div>
													<span className="text-gray-500 block">Order #</span>
													<span className="font-medium text-gray-900">
												{order.id}
											</span>
												</div>
												<div>
													<span className="text-gray-500 block">Date</span>
													<span className="font-medium text-gray-900">
												{formatDate(order.createdAt)}
											</span>
												</div>
												<div>
													<span className="text-gray-500 block">Total</span>
													<span className="font-medium text-gray-900">
												{formatMoney(order.totalAmount, order.currency)}
											</span>
												</div>
											</div>

											<div className="flex items-center gap-2.5">
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}
										>
											{order.Status?.label || "Unknown"}
										</span>

												{statusCode === "paid" && (
													<button
														onClick={() => handleStatusChange(order.id, "shipped")}
														disabled={isUpdating}
														className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
													>
														{isUpdating ? "Updating..." : "Mark as Shipped"}
													</button>
												)}

												{(statusCode === "paid" || statusCode === "shipped") && (
													<button
														onClick={() => showRefundConfirm(order.id)}
														disabled={isUpdating}
														className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
													>
														{isUpdating ? "Processing..." : "Refund"}
													</button>
												)}
											</div>
										</div>

										<div className="divide-y divide-gray-200 px-6">
											{order.Items?.map((item) => (
												<div
													key={item.id}
													className="py-4 flex justify-between items-center"
												>
													<div>
														<h3 className="font-medium text-gray-900">
															{item.Price?.Product?.name || "Product"}
														</h3>
														{item.Price?.Product?.description && (
															<p className="text-sm text-gray-500">
																{item.Price.Product.description}
															</p>
														)}
														<p className="text-sm text-gray-500 mt-1">
															Qty: {item.quantity}
														</p>
													</div>

													<div className="font-medium text-gray-900">
														{formatMoney(item.unitAmount, order.currency)}
													</div>
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			}
		</>
	);
};

export default OrdersPage;