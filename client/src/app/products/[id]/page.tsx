"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCartMinus } from "lucide-react";
import { getProductById } from "@/actions/product";
import { type Product } from "@/types/types";
import { useAuth } from "@/context/useAuth";
import { useCart } from "@/context/CartContext";
import {
	formatPrice,
	formatInterval,
	getPriceOptionLabel,
	getDefaultPrice,
} from "@/lib/pricing";

const ProductDetailPage: React.FC = () => {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const { isAuthenticated, user } = useAuth();
	const { totalItems, openCart, addToCart, buyNow, buyingPriceId } = useCart();

	const [product, setProduct] = useState<Product | null>(null);
	const [selectedPriceId, setSelectedPriceId] = useState<number | string | null>(
		null
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProduct = async () => {
		if (!id) return;

		setLoading(true);
		setError(null);

		const result = await getProductById(id);

		if (!result.success || !result.data) {
			setError(result.message || "Failed to fetch product.");
		} else {
			setProduct(result.data);
			const defaultPrice = getDefaultPrice(result.data.Prices);
			if (defaultPrice) {
				setSelectedPriceId(defaultPrice.id);
			}
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchProduct();
	}, [id]);

	const activePrice =
		product?.Prices?.find((p) => p.id === selectedPriceId) ??
		getDefaultPrice(product?.Prices);
	const isSubscription = activePrice?.type === "recurring";
	const isOwnProduct = Boolean(
		isAuthenticated && user?.id && product?.Seller?.id === user.id
	);

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-12">
			{loading && (
				<div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 p-8 dark:border-gray-800 dark:bg-gray-800/50" />
			)}

			{!loading && (error || !product) && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
					<p className="font-medium text-red-700 dark:text-red-400">
						{error || "Product not found."}
					</p>
					<div className="mt-4 flex justify-center gap-3">
						<button
							onClick={fetchProduct}
							className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
						>
							Try Again
						</button>
						<button
							onClick={() => router.push("/products")}
							className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
						>
							All Products
						</button>
					</div>
				</div>
			)}

			{!loading && !error && product && (
				<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
					<div className="border-b border-gray-100 pb-6 dark:border-gray-800">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
							{product.name}
						</h1>

						{product.Seller?.name && (
							<p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
								Seller: {isOwnProduct ? "You" : product.Seller.name}
							</p>
						)}
					</div>

					<div className="py-6">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
							Description
						</h3>
						<p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
							{product.description || "No description provided for this product."}
						</p>
					</div>

					<div className="border-t border-gray-100 pt-6 dark:border-gray-800">
						{product.Prices && product.Prices.length > 0 ? (
							<div className="flex flex-col gap-6">
								<div>
									<span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
										{isSubscription ? "Subscription Plan" : "Purchase Option"}
									</span>

									<p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
										{formatPrice(activePrice?.unitAmount, activePrice?.currency)}
										{formatInterval(activePrice) && (
											<span className="ml-1.5 text-base font-normal text-gray-500 dark:text-gray-400">
												{formatInterval(activePrice)}
											</span>
										)}
									</p>

									{product.Prices.length > 1 && (
										<div className="mt-4">
											<label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
												Choose Purchase Option
											</label>
											<div className="flex flex-wrap gap-2">
												{product.Prices.map((price) => {
													const intervalText = formatInterval(price);
													return (
														<button
															key={price.id}
															type="button"
															onClick={() => setSelectedPriceId(price.id)}
															className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
																activePrice?.id === price.id
																	? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300"
																	: "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
															}`}
														>
															<span>{getPriceOptionLabel(price)}</span>
															<span className="ml-1.5 font-normal opacity-80">
																({formatPrice(price.unitAmount, price.currency)}
																{intervalText ? ` ${intervalText}` : ""})
															</span>
														</button>
													);
												})}
											</div>
										</div>
									)}
								</div>

								{activePrice && (
									<div className="flex flex-col gap-3 sm:flex-row">
										{isOwnProduct ? (
											<button
												onClick={() => router.push(`/my-products/${product.id}`)}
												className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
											>
												Manage Your Product
											</button>
										) : isSubscription ? (
											<button
												onClick={() => buyNow(activePrice.id, 1)}
												disabled={buyingPriceId === activePrice.id}
												className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{buyingPriceId === activePrice.id
													? "Redirecting..."
													: `Subscribe (${getPriceOptionLabel(activePrice)})`}
											</button>
										) : (
											<>
												<button
													onClick={() => addToCart(product, activePrice)}
													className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
												>
													Add to Cart
												</button>

												<button
													onClick={() => buyNow(activePrice.id, 1)}
													disabled={buyingPriceId === activePrice.id}
													className="flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
												>
													{buyingPriceId === activePrice.id
														? "Redirecting..."
														: "Buy Now"}
												</button>
											</>
										)}
									</div>
								)}
							</div>
						) : (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Pricing is currently unavailable.
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductDetailPage;