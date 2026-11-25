"use client";

import Link from "next/link";
import { Price, Product } from "@/types/types";
import {
	formatInterval,
	formatPrice,
	getDefaultPrice,
	getPriceOptionLabel,
} from "@/lib/pricing";

interface ProductCardProps {
	product: Product;
	isAuthenticated: boolean;
	currentUserId?: number;
	addToCart: (product: Product, price?: Price) => void;
	buyNow: (priceId: number | string, quantity: number) => void;
	buyingPriceId: number | string | null;
}

export const ProductCard: React.FC<ProductCardProps> = (
	{
		product,
		isAuthenticated,
		currentUserId,
		addToCart,
		buyNow,
		buyingPriceId,
	}) => {
	const defaultPrice = getDefaultPrice(product.Prices);
	const isSubscriptionOnly = defaultPrice?.type === "recurring";
	const hasSubscriptionPlans = Boolean(
		product.Prices?.some((p) => p.type === "recurring")
	);

	const isOwnProduct = Boolean(
		isAuthenticated && currentUserId && product.Seller?.id === currentUserId
	);

	return (
		<div
			className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
			<Link
				href={
					isOwnProduct
						? `/my-products/${product.id}`
						: `/products/${product.id}`
				}
				className="group flex flex-col focus:outline-none"
			>
				<h2
					className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
					{product.name}
				</h2>

				{product.description && (
					<p className="mt-1.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
						{product.description}
					</p>
				)}

				{product.Seller?.name && (
					<p className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-400">
						Seller: {isOwnProduct ? "You" : product.Seller.name}
					</p>
				)}
			</Link>

			<div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
				{defaultPrice && (
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-baseline gap-1">
							<span className="text-lg font-bold text-gray-900 dark:text-white">
								{formatPrice(defaultPrice.unitAmount, defaultPrice.currency)}
							</span>
							{formatInterval(defaultPrice) && (
								<span className="text-xs font-normal text-gray-500 dark:text-gray-400">
									{formatInterval(defaultPrice)}
								</span>
							)}
						</div>

						{!isOwnProduct && hasSubscriptionPlans && !isSubscriptionOnly && (
							<Link
								href={`/products/${product.id}`}
								className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								Subscription plans →
							</Link>
						)}
					</div>
				)}

				{defaultPrice && (
					<div className="flex items-center gap-2 pt-1">
						{isOwnProduct ? (
							<div
								className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
								Your Product
							</div>
						) : isSubscriptionOnly ? (
							<button
								onClick={() => buyNow(defaultPrice.id, 1)}
								disabled={buyingPriceId === defaultPrice.id}
								className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{buyingPriceId === defaultPrice.id
									? "Redirecting..."
									: `Subscribe (${getPriceOptionLabel(defaultPrice)})`}
							</button>
						) : (
							<>
								<button
									onClick={() => addToCart(product, defaultPrice)}
									className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
								>
									Add to Cart
								</button>

								<button
									onClick={() => buyNow(defaultPrice.id, 1)}
									disabled={buyingPriceId === defaultPrice.id}
									className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
								>
									{buyingPriceId === defaultPrice.id
										? "Redirecting..."
										: "Buy Now"}
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};