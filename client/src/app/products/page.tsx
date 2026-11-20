"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCartMinus } from "lucide-react";
import { getProducts, cancelOrder } from "@/actions/product";
import { type Product } from "@/types/types";
import { useAuth } from "@/context/useAuth";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationProvider";

const CancelCheckoutHandler: React.FC<{
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

		if (isCanceled && !hasNotified.current) {
			hasNotified.current = true;

			if (orderId) {
				cancelOrder(orderId);
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
		}
	}, [searchParams, router, notification, onOpenCart, totalItems]);

	return null;
};

const ProductsPage: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const { totalItems, openCart, addToCart, buyNow, buyingPriceId } = useCart();

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProducts = async () => {
		setLoading(true);
		setError(null);

		const result = await getProducts();

		if (!result.success) {
			setError(result.message);
		} else {
			setProducts(result.data);
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const formatPrice = (amount?: number, currency: string = "usd") => {
		if (amount === undefined || amount === null) return null;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-12">
			<Suspense fallback={null}>
				<CancelCheckoutHandler onOpenCart={openCart} totalItems={totalItems} />
			</Suspense>

			<div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-center">
				<div>
					<h2 className="text-base font-semibold text-gray-900 dark:text-white">
						{isAuthenticated ? "Catalog Management" : "Products"}
					</h2>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{isAuthenticated
							? "Add new items, update pricing, or shop the catalog."
							: "Browse available products and add them to your cart."}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{isAuthenticated && (
						<Link
							href="/my-products"
							className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
						>
							My products
						</Link>
					)}

					<button
						onClick={openCart}
						className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
					>
						<ShoppingCartMinus size={16} />
						<span>Cart</span>
						{totalItems > 0 && (
							<span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
								{totalItems}
							</span>
						)}
					</button>
				</div>
			</div>

			<section>
				{loading && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((skeleton) => (
							<div
								key={skeleton}
								className="h-56 animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-6 dark:border-gray-800 dark:bg-gray-800/50"
							/>
						))}
					</div>
				)}

				{!loading && error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
						<p className="font-medium text-red-700 dark:text-red-400">{error}</p>
						<button
							onClick={fetchProducts}
							className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
						>
							Try Again
						</button>
					</div>
				)}

				{!loading && !error && products.length === 0 && (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							No products found
						</h3>
						<p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
							You haven&apos;t created any products yet. Click &quot;Create product&quot; above to add your first one.
						</p>
					</div>
				)}

				{!loading && !error && products.length > 0 && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{products.map((product) => {
							const primaryPrice = product.Prices?.[0];

							return (
								<div
									key={product.id}
									className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
								>
									<Link
										href={`/products/${product.id}`}
										className="group flex flex-col focus:outline-none"
									>
										<h2 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 line-clamp-1">
											{product.name}
										</h2>

										{product.description && (
											<p className="mt-1.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
												{product.description}
											</p>
										)}

										{product.Seller?.name && (
											<p className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-400">
												Seller: {product.Seller.name}
											</p>
										)}
									</Link>

									<div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
										<div className="flex flex-wrap gap-2">
											{product.Prices?.map((price) => (
												<span
													key={price.id}
													className="text-base font-bold text-gray-900 dark:text-white"
												>
													{formatPrice(price.unitAmount, price.currency)}
												</span>
											))}
										</div>

										{primaryPrice && (
											<div className="flex items-center gap-2">
												<button
													onClick={() => addToCart(product)}
													className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
												>
													Add to Cart
												</button>

												<button
													onClick={() => buyNow(primaryPrice.id, 1)}
													disabled={buyingPriceId === primaryPrice.id}
													className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
												>
													{buyingPriceId === primaryPrice.id
														? "Redirecting..."
														: "Buy Now"}
												</button>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
};

export default ProductsPage;