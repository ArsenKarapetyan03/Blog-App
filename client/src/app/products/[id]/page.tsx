"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCartMinus } from "lucide-react";
import { getProductById } from "@/actions/product";
import { type Product } from "@/types/types";
import { useCart } from "@/context/CartContext";

const ProductDetailPage: React.FC = () => {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const { totalItems, openCart, addToCart, buyNow, buyingPriceId } = useCart();

	const [product, setProduct] = useState<Product | null>(null);
	const [selectedPriceId, setSelectedPriceId] = useState<number | string | null>(null);
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
			if (result.data.Prices && result.data.Prices.length > 0) {
				setSelectedPriceId(result.data.Prices[0].id);
			}
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchProduct();
	}, [id]);

	const activePrice =
		product?.Prices?.find((p) => p.id === selectedPriceId) ||
		product?.Prices?.[0];

	const formatPrice = (amount?: number, currency: string = "usd") => {
		if (amount === undefined || amount === null) return null;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-12">
			<div className="mb-8 flex items-center justify-end gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">

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
								Seller: {product.Seller.name}
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
										Price
									</span>

									{product.Prices.length === 1 ? (
										<p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
											{formatPrice(activePrice?.unitAmount, activePrice?.currency)}
										</p>
									) : (
										<div className="mt-2 flex flex-wrap gap-2">
											{product.Prices.map((price) => (
												<button
													key={price.id}
													onClick={() => setSelectedPriceId(price.id)}
													className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
														selectedPriceId === price.id
															? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300"
															: "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
													}`}
												>
													{formatPrice(price.unitAmount, price.currency)}
												</button>
											))}
										</div>
									)}
								</div>

								{activePrice && (
									<div className="flex flex-col gap-3 sm:flex-row">
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