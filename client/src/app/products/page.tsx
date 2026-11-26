"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { getProducts,  } from "@/actions/product";
import { type Product } from "@/types/types";
import { useAuth } from "@/context/useAuth";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/Product/ProductCard";
import { CancelCheckoutHandler } from "@/components/Product/CancelCheckoutHandler";

const ProductsPage: React.FC = () => {
	const { isAuthenticated, user } = useAuth();
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

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-12">
			<Suspense fallback={null}>
				<CancelCheckoutHandler onOpenCart={openCart} totalItems={totalItems} />
			</Suspense>

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
							There are no products available right now. Check back later or add
							items from &quot;My products&quot;.
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
		</div>
	);
};

export default ProductsPage;