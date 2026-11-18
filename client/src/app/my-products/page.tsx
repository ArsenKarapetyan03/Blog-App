"use client";

import React, { useEffect, useState } from "react";
import { getUserProducts } from "@/actions/product";
import { BackButton } from "@/components/ui/BackButton";

interface UserProduct {
	id: string;
	name: string;
	description?: string | null;
	price?: number;
	currency?: string;
	status?: "active" | "canceled" | "past_due" | "paid" | string;
	imageUrl?: string | null;
	purchasedAt?: string;
}

interface ApiResponse {
	success: boolean;
	data: UserProduct[];
	message?: string;
}

const MyProductsPage: React.FC = () => {
	const [products, setProducts] = useState<UserProduct[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getUserProducts();
				setProducts(data);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred");
				}
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
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
						onClick={() => window.location.reload()}
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
						You haven&apos;t purchased any products or subscribed to any plans yet.
					</p>
				</div>
			)}

			{!loading && !error && products.length > 0 && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<div
							key={product.id}
							className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
						>
							<div>
								{product.imageUrl && (
									<img
										src={product.imageUrl}
										alt={product.name}
										className="mb-4 h-40 w-full rounded-lg object-cover"
									/>
								)}

								<div className="flex items-start justify-between gap-2">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
										{product.name}
									</h2>

									{product.status && (
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
												product.status === "active" || product.status === "paid"
													? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
													: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
											}`}
										>
                      {product.status}
                    </span>
									)}
								</div>

								{product.description && (
									<p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
										{product.description}
									</p>
								)}
							</div>

							<div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
								{product.price !== undefined ? (
									<span className="text-base font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price, product.currency)}
                  </span>
								) : (
									<span className="text-xs text-gray-400">Purchased</span>
								)}

								{product.purchasedAt && (
									<span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(product.purchasedAt).toLocaleDateString()}
                  </span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyProductsPage;