"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProducts } from "@/actions/product";
import { Product } from "@/types/types";
import { formatPrice } from "@/lib/helperFunctions";

const MyProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
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

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-12">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					My Products
				</h1>
				<Link
					href="/my-products/new"
					className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
				>
					+ Add Product
				</Link>
			</div>

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
					<Link
						href="/my-products/new"
						className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
					>
						Create your first product
					</Link>
				</div>
			)}

			{!loading && !error && products.length > 0 && (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<Link
							key={product.id}
							href={`/my-products/${product.id}`}
							className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
						>
							<div>
								<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
									{product.name}
								</h2>

								{product.description && (
									<p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
										{product.description}
									</p>
								)}
							</div>

							<div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
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

								<span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
									View details
								</span>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default MyProductsPage;