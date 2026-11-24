"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProducts } from "@/actions/product";
import { getBalance, BalanceItem } from "@/actions/balance";
import { Product } from "@/types/types";
import { formatPrice } from "@/lib/helperFunctions";
import { RefreshCcw } from "lucide-react";

const MyProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [balance, setBalance] = useState<BalanceItem>({
		availableAmount: 0,
		pendingAmount: 0,
		currency: "usd",
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [refreshingBalance, setRefreshingBalance] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleRefreshBalance = async () => {
		try {
			setRefreshingBalance(true);
			const balanceRes = await getBalance();
			if (balanceRes.success && balanceRes.data.length > 0) {
				setBalance(balanceRes.data[0]);
			}
		} finally {
			setRefreshingBalance(false);
		}
	};

	useEffect(() => {
		const loadPageData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [productsData, balanceRes] = await Promise.all([
					getUserProducts(),
					getBalance(),
				]);

				setProducts(productsData);

				if (balanceRes.success && balanceRes.data.length > 0) {
					setBalance(balanceRes.data[0]);
				}
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

		loadPageData();
	}, []);

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-12">
			<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div className="flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
					<div>
						<p className="text-xs font-medium text-gray-500 dark:text-gray-400">
							Available Balance
						</p>
						<p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
							{loading || refreshingBalance
								? "..."
								: formatPrice(balance.availableAmount, balance.currency)}
						</p>
					</div>

					<div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />

					<div>
						<p className="text-xs font-medium text-gray-500 dark:text-gray-400">
							Pending Balance
						</p>
						<p className="mt-0.5 text-lg font-semibold text-amber-600 dark:text-amber-400">
							{loading || refreshingBalance
								? "..."
								: formatPrice(balance.pendingAmount, balance.currency)}
						</p>
					</div>

					<button
						type="button"
						onClick={handleRefreshBalance}
						disabled={loading || refreshingBalance}
						aria-label="Refresh balance"
						title="Refresh balance"
						className="ml-auto rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 sm:ml-2"
					>
						<RefreshCcw size={18}/>
					</button>
				</div>

				<Link
					href="/my-products/new"
					className="self-start rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:self-auto"
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