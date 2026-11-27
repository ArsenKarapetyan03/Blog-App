"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/actions/product";
import { type Product } from "@/types/types";
import { useAuth } from "@/context/useAuth";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/Product/ProductCard";
import { CancelCheckoutHandler } from "@/components/Product/CancelCheckoutHandler";
import { Search } from "@/components/Search";
import Pagination from "@/components/Pagination";
import { LoadingComponent } from "@/components/ui/LoadingComponent";

const PRODUCTS_PER_PAGE = 6;

const ProductsContent: React.FC = () => {
	const { isAuthenticated, user } = useAuth();
	const { totalItems, openCart, addToCart, buyNow, buyingPriceId } = useCart();

	const searchParams = useSearchParams();
	const currentPage = Number(searchParams.get("page")) || 1;
	const query = searchParams.get("query") || "";

	const [products, setProducts] = useState<Product[]>([]);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);

		const result = await getProducts({
			page: currentPage,
			limit: PRODUCTS_PER_PAGE,
			query: query || undefined,
		});

		if (!result.success) {
			setError(result.message);
			setProducts([]);
		} else {
			const list = Array.isArray(result.data)
				? result.data
				: result?.data?.products ?? [];
			setProducts(list);
			setTotalPages(result?.data?.totalPages ?? 1);
		}

		setLoading(false);
	}, [currentPage, query]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return (
		<div>
			<Suspense fallback={null}>
				<CancelCheckoutHandler onOpenCart={openCart} totalItems={totalItems} />
			</Suspense>

			<div className="mb-6 flex justify-end">
				<Search />
			</div>

			<section>
				{loading && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((skeleton) => (
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
							{query
								? `No products matched "${query}". Try a different search term.`
								: 'There are no products available right now. Check back later or add items from "My products".'}
						</p>
					</div>
				)}

				{!loading && !error && products.length > 0 && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{products.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								isAuthenticated={isAuthenticated}
								currentUserId={user?.id}
								addToCart={addToCart}
								buyNow={buyNow}
								buyingPriceId={buyingPriceId}
							/>
						))}
					</div>
				)}
			</section>

			{totalPages > 1 && (
				<div className="mt-6">
					<Pagination currentPage={currentPage} totalPages={totalPages} />
				</div>
			)}
		</div>
	);
};

const ProductsPage = () => {
	return (
		<Suspense fallback={<LoadingComponent />}>
			<ProductsContent />
		</Suspense>
	);
};

export default ProductsPage;