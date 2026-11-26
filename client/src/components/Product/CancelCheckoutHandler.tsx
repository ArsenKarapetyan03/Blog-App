import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { cancelOrder } from "@/actions/product";
import { useNotification } from "@/context/NotificationProvider";

export const CancelCheckoutHandler: React.FC<{
	onOpenCart: () => void;
	totalItems: number;
}> = ({ onOpenCart, totalItems }) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const notification = useNotification();
	const hasNotified = useRef(false);

	useEffect(() => {
		const isCanceled = searchParams.get("cancel") === "true";
		const orderId = searchParams.get("orderId");

		if (!isCanceled || hasNotified.current) {
			return;
		}
		hasNotified.current = true;

		const handleCancel = async () => {
			if (orderId) {
				const res = await cancelOrder(orderId);
				if (!res.success) {
					notification.error({
						title: "Order Cancellation Issue",
						description: res.message,
						placement: "topRight",
					});
				}
			}

			const key = `cancel-checkout-${Date.now()}`;

			notification.warning({
				key,
				title: "Checkout Canceled",
				description:
					totalItems > 0
						? "No payment was processed. Your items are still saved in your cart."
						: "No payment was processed. You can try checking out again anytime.",
				placement: "topRight",
				duration: 6,
				actions:
					totalItems > 0 ? (
						<button
							onClick={() => {
				notification.destroy(key);
				onOpenCart();
			}}
			className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700"
				>
				Open Cart
			</button>
		) : undefined,
		});

			router.replace("/products", { scroll: false });
		};

		handleCancel();
	}, [searchParams, router, notification, onOpenCart, totalItems]);

	return null;
};