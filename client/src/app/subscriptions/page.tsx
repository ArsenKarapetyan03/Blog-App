"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Modal } from "antd";
import { useNotification } from "@/context/NotificationProvider";
import { getSubscriptions, cancelSubscription } from "@/actions/subscription";
import { type Subscription } from "@/types/types";

const SubscriptionSuccessHandler: React.FC<{
	onSuccess?: () => void;
}> = ({ onSuccess }) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const notification = useNotification();
	const hasHandled = useRef(false);

	useEffect(() => {
		const orderId = searchParams.get("orderId");

		if (orderId && !hasHandled.current) {
			hasHandled.current = true;

			notification.success({
				title: "Subscription Activated",
				description: "Your subscription is now active.",
				placement: "topRight",
			});

			onSuccess?.();
			router.replace("/subscriptions", { scroll: false });
		}
	}, [searchParams, notification, router, onSuccess]);

	return null;
};

const SUB_STATUS_STYLES: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	trialing: "bg-blue-100 text-blue-800",
	past_due: "bg-yellow-100 text-yellow-800",
	canceled: "bg-gray-100 text-gray-800",
	unpaid: "bg-red-100 text-red-800",
	incomplete: "bg-orange-100 text-orange-800",
};

const SubscriptionsPage = () => {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [cancelingId, setCancelingId] = useState<number | null>(null);

	const notification = useNotification();

	const fetchSubscriptions = async () => {
		try {
			setLoading(true);
			const response = await getSubscriptions();
			setSubscriptions(response?.data ?? []);
		} catch (error) {
			console.warn("Failed to fetch subscriptions:", error);
			setSubscriptions([]);
			notification.error({
				title: "Failed to Load Subscriptions",
				description:
					"Could not retrieve your subscriptions. Please refresh the page.",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSubscriptions();
	}, []);

	const handleCancel = async (subscriptionId: number) => {
		try {
			setCancelingId(subscriptionId);
			const res = await cancelSubscription(subscriptionId);

			if (!res.success) {
				notification.error({
					title: "Cancellation Failed",
					description:
						res.message || "Could not cancel your subscription. Please try again.",
				});
				return;
			}

			setSubscriptions((prev) =>
				prev.map((sub) =>
					sub.id === subscriptionId
						? {
							...sub,
							status: res.data?.status ?? "canceled",
							cancelAtPeriodEnd: res.data?.cancelAtPeriodEnd ?? true,
						}
						: sub
				)
			);

			notification.success({
				title: "Subscription Canceled",
				description: "Your subscription has been canceled.",
			});
		} catch (error) {
			console.error("Failed to cancel subscription:", error);
			notification.error({
				title: "Unexpected Error",
				description: "Something went wrong while canceling your subscription.",
			});
		} finally {
			setCancelingId(null);
		}
	};

	const showCancelConfirm = (subscriptionId: number, planName?: string) => {
		Modal.confirm({
			title: `Cancel ${planName || "Subscription"}?`,
			content:
				"Are you sure you want to cancel this subscription? You will retain access until the end of your current billing period.",
			okText: "Confirm Cancellation",
			cancelText: "Keep Plan",
			okType: "danger",
			centered: true,
			async onOk() {
				await handleCancel(subscriptionId);
			},
		});
	};

	const formatMoney = (amountInCents?: number, currency = "usd") => {
		if (amountInCents === undefined || amountInCents === null) return "";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amountInCents / 100);
	};

	const formatDate = (isoString?: string | null) => {
		if (!isoString) return "—";
		return new Date(isoString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatInterval = (interval?: string | null, count?: number | null) => {
		if (!interval) return "";
		const n = count ?? 1;
		return n > 1 ? `/ ${n} ${interval}s` : `/ ${interval}`;
	};

	return (
		<>
			<Suspense fallback={null}>
				<SubscriptionSuccessHandler onSuccess={fetchSubscriptions} />
			</Suspense>

			<div className="mx-auto w-full max-w-6xl p-6">
				<div className="mb-6 border-b border-gray-200 pb-4">
					<h1 className="text-xl font-semibold text-gray-900">
						My Subscriptions
					</h1>
					<p className="text-sm text-gray-500">
						Manage your active plans and billing cycles.
					</p>
				</div>

				{loading ? (
					<p className="text-gray-500">Loading your subscriptions...</p>
				) : subscriptions.length === 0 ? (
					<div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
						<p className="text-gray-500">No subscriptions found.</p>
					</div>
				) : (
					<div className="space-y-6">
						{subscriptions.map((sub) => {
							const status = sub.status || "unknown";
							const badgeStyle =
								SUB_STATUS_STYLES[status] || "bg-gray-100 text-gray-800";
							const isCanceling = cancelingId === sub.id;
							const canCancel =
								(status === "active" ||
									status === "trialing" ||
									status === "past_due") &&
								!sub.cancelAtPeriodEnd;

							return (
								<div
									key={sub.id}
									className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
								>
									<div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
										<div className="flex flex-wrap gap-6 text-sm">
											<div>
												<span className="block text-gray-500">Plan</span>
												<span className="font-medium text-gray-900">
													{sub.Price?.Product?.name || `Subscription #${sub.id}`}
												</span>
											</div>

											<div>
												<span className="block text-gray-500">Billing</span>
												<span className="font-medium text-gray-900">
													{formatMoney(
														sub.Price?.unitAmount,
														sub.Price?.currency
													)}{" "}
													<span className="font-normal text-gray-500">
														{formatInterval(
															sub.Price?.interval,
															sub.Price?.intervalCount
														)}
													</span>
												</span>
											</div>

											<div>
												<span className="block text-gray-500">
													{sub.cancelAtPeriodEnd
														? "Ends On"
														: "Next Billing Date"}
												</span>
												<span className="font-medium text-gray-900">
													{formatDate(sub.currentPeriodEnd)}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-2.5">
											<span
												className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyle}`}
											>
												{sub.cancelAtPeriodEnd && status === "active"
													? "Canceling at period end"
													: status.replace("_", " ")}
											</span>

											{canCancel && (
												<button
													onClick={() =>
														showCancelConfirm(sub.id, sub.Price?.Product?.name)
													}
													disabled={isCanceling}
													className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
												>
													{isCanceling ? "Canceling..." : "Cancel Plan"}
												</button>
											)}
										</div>
									</div>

									{sub.Price?.Product?.description && (
										<div className="px-6 py-4">
											<p className="text-sm text-gray-600">
												{sub.Price.Product.description}
											</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
};

export default SubscriptionsPage;