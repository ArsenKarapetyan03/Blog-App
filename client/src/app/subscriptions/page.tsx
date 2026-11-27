"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Modal } from "antd";
import { useNotification } from "@/context/NotificationProvider";
import { getMySubscriptions, cancelSubscriptionAtPeriodEnd, cancelSubscriptionNow } from "@/actions/subscription";
import { type Subscription } from "@/types/types";
import { formatInterval, formatPrice } from "@/lib/pricing";

const SUB_STATUS_STYLES: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	trialing: "bg-blue-100 text-blue-800",
	past_due: "bg-yellow-100 text-yellow-800",
	canceled: "bg-gray-100 text-gray-800",
	unpaid: "bg-red-100 text-red-800",
	incomplete: "bg-orange-100 text-orange-800",
};

const formatDate = (isoString?: string | null) => {
	if (!isoString) return "—";
	return new Date(isoString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const SubscriptionSuccessHandler: React.FC<{
	onSuccess?: () => void;
}> = ({onSuccess}) => {
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
			router.replace("/subscriptions", {scroll: false});
		}
	}, [searchParams, notification, router, onSuccess]);

	return null;
};

const SubscriptionsPage = () => {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [cancelingId, setCancelingId] = useState<number | null>(null);

	const notification = useNotification();

	const fetchSubscriptions = useCallback(async () => {
		try {
			setLoading(true);
			const response = await getMySubscriptions();
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
	}, [notification]);

	useEffect(() => {
		fetchSubscriptions();
	}, [fetchSubscriptions]);

	const handleCancelAtPeriodEnd = async (subscriptionId: number) => {
		try {
			setCancelingId(subscriptionId);
			const res = await cancelSubscriptionAtPeriodEnd(subscriptionId);

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
							status: res.data?.status ?? sub.status,
							cancelAtPeriodEnd: res.data?.cancelAtPeriodEnd ?? true,
							canceledAt: res.data?.canceledAt ?? new Date().toISOString(),
						}
						: sub
				)
			);

			notification.success({
				title: "Subscription Canceled",
				description:
					"Your subscription will remain active until the end of the current billing period.",
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
				await handleCancelAtPeriodEnd(subscriptionId);
			},
		});
	};

	const handleCancelNow = async (subscriptionId: number) => {
		try {
			setCancelingId(subscriptionId);
			const res = await cancelSubscriptionNow(subscriptionId);

			if (!res.success) {
				notification.error({
					title: "Cancellation Failed",
					description:
						res.message || "Could not cancel your subscription. Please try again.",
				});
				return;
			}

			const nowIso = new Date().toISOString();

			setSubscriptions((prev) =>
				prev.map((sub) =>
					sub.id === subscriptionId
						? {
							...sub,
							status: res.data?.status ?? "canceled",
							cancelAtPeriodEnd: false,
							canceledAt: res.data?.canceledAt ?? nowIso,
							currentPeriodEnd: res.data?.currentPeriodEnd ?? nowIso,
						}
						: sub
				)
			);

			notification.success({
				title: "Subscription Canceled Immediately",
				description: "Your subscription has ended and access has been revoked.",
			});
		} catch (error) {
			console.error("Failed to cancel subscription immediately:", error);
			notification.error({
				title: "Unexpected Error",
				description:
					error instanceof Error
						? error.message
						: "Something went wrong while canceling your subscription.",
			});
		} finally {
			setCancelingId(null);
		}
	};

	const showCancelNowConfirm = (subscriptionId: number, planName?: string) => {
		Modal.confirm({
			title: `Cancel ${planName || "Subscription"} Immediately?`,
			content:
				"Are you sure you want to end this subscription right now? Your access will be revoked immediately and you will not be refunded for the remaining period.",
			okText: "Cancel Immediately",
			cancelText: "Keep Plan",
			okType: "danger",
			centered: true,
			async onOk() {
				await handleCancelNow(subscriptionId);
			},
		});
	};

	return (
		<>
			<Suspense fallback={null}>
				<SubscriptionSuccessHandler onSuccess={fetchSubscriptions}/>
			</Suspense>

			<div>
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
							const isScheduledToCancel =
								sub.cancelAtPeriodEnd && status === "active";

							const badgeStyle = isScheduledToCancel
								? "bg-amber-100 text-amber-800"
								: SUB_STATUS_STYLES[status] || "bg-gray-100 text-gray-800";

							const isCanceling = cancelingId === sub.id;
							const isActiveSub = ["active", "trialing", "past_due"].includes(status);

							const canCancelAtPeriodEnd = isActiveSub && !sub.cancelAtPeriodEnd;
							const canCancelNow = isActiveSub;

							const product = sub.Price?.Product;

							return (
								<div
									key={sub.id}
									className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
								>
									<div
										className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
										<div>
											<div className="flex items-center gap-3">
												<h2 className="text-lg font-semibold text-gray-900">
													{product?.name || `Subscription #${sub.id}`}
												</h2>
												<span
													className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStyle}`}
												>
													{isScheduledToCancel
														? "Canceling at period end"
														: status.replace("_", " ")}
												</span>
											</div>

											{product?.description && (
												<p className="mt-1 text-sm text-gray-600">
													{product.description}
												</p>
											)}
										</div>

										{(canCancelAtPeriodEnd || canCancelNow) && (
											<div className="flex items-center gap-2">
												{canCancelAtPeriodEnd && (
													<button
														onClick={() => showCancelConfirm(sub.id, product?.name)}
														disabled={isCanceling}
														className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{isCanceling ? "Canceling..." : "Cancel at Period End"}
													</button>
												)}

												{canCancelNow && (
													<button
														onClick={() => showCancelNowConfirm(sub.id, product?.name)}
														disabled={isCanceling}
														className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{isCanceling ? "Canceling..." : "Cancel Now"}
													</button>
												)}
											</div>
										)}
									</div>

									<div className="grid grid-cols-1 gap-4 px-6 py-4 text-sm sm:grid-cols-3">
										<div>
											<span className="block text-gray-500">Price</span>
											<span className="font-medium text-gray-900">
												{formatPrice(
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
												Current Billing Period
											</span>
											<span className="font-medium text-gray-900">
												{formatDate(sub.currentPeriodStart)} –{" "}
												{formatDate(sub.currentPeriodEnd)}
											</span>
										</div>

										<div>
											<span className="block text-gray-500">
												{sub.cancelAtPeriodEnd || status === "canceled"
													? "Access Ends On"
													: "Next Renewal Date"}
											</span>
											<span className="font-medium text-gray-900">
												{formatDate(sub.currentPeriodEnd)}
											</span>
										</div>

										{sub.canceledAt && (
											<div>
												<span className="block text-gray-500">
													Canceled On
												</span>
												<span className="font-medium text-gray-900">
													{formatDate(sub.canceledAt)}
												</span>
											</div>
										)}
									</div>
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