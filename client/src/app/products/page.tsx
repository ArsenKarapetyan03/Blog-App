"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notification } from "antd";
import { createCheckoutSession, getProducts } from "@/actions/product";
import { type Product } from "@/types/types";
import { SignInModal } from "@/components/ui/SignInModal";
import { useAuth } from "@/context/useAuth";

interface Price {
	id: number | string;
	unitAmount: number;
	currency: string;
	active: boolean;
}

const ProductsPage: React.FC = () => {
	const {isAuthenticated} = useAuth();

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [api, contextHolder] = notification.useNotification();

	const [buyingPriceId, setBuyingPriceId] = useState<number | string | null>(null);
	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

	const showErrorNotification = (description: string) => {
		api.error({
			title: "Error",
			description,
			placement: "topRight",
		});
	};

	const fetchProducts = async () => {
		setLoading(true);

		const result = await getProducts();

		if (!result.success) {
			showErrorNotification(result.message);
		} else {
			setProducts(result.data);
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleCheckout = async (priceId: number | string) => {
		if (!isAuthenticated) {
			setIsSignInModalOpen(true);
			return;
		}

		setBuyingPriceId(priceId);

		const result = await createCheckoutSession(priceId, 1);

		if (!result.success || !result.url) {
			showErrorNotification(result.message || "Failed to start checkout.");
			setBuyingPriceId(null);
			return;
		}

		window.location.href = result.url;
	};

	const formatPrice = (cents: number, curr: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: curr.toUpperCase(),
		}).format(cents / 100);
	};

	return (
		<div className="w-full">
			{contextHolder}

			{isAuthenticated && (
				<div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 py-4 sm:flex-row sm:items-center">
					<div>
						<h2 className="text-base font-semibold text-slate-900">
							Catalog Management
						</h2>
						<p className="text-xs text-slate-500">
							Add new items or update pricing for your store.
						</p>
					</div>

					<div className="flex gap-4">
						<Link
							href="/products/create"
							className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
						>
							<span>+</span>
							<span>Create product</span>
						</Link>

						<Link
							href="/my-products"
							className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
						>
							My products
						</Link>
					</div>
				</div>
			)}

			<section>
				{loading ? (
					<div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
						Loading products...
					</div>
				) : products.length === 0 ? (
					<div
						className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
						You haven&apos;t created any products yet. Click &quot;Create product&quot; above to add your first one.
					</div>
				) : (
					<div className="space-y-4">
						{products.map((product) => {
							const activePrice =
								product.Prices?.find((p) => p.active) || product.Prices?.[0];

							return (
								<div
									key={product.id}
									className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 sm:flex-row sm:items-center"
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2.5">
											<h3 className="text-base font-semibold text-gray-900">
												{product.name}
											</h3>
											{activePrice && (
												<span
													className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
													{formatPrice(activePrice.unitAmount, activePrice.currency)}
												</span>
											)}
										</div>

										{product.description && (
											<p className="text-sm text-gray-600">
												{product.description}
											</p>
										)}
									</div>

									{activePrice && (
										<button
											onClick={() => handleCheckout(activePrice.id)}
											disabled={buyingPriceId === activePrice.id}
											className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{buyingPriceId === activePrice.id
												? "Redirecting..."
												: "Buy Now"}
										</button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</section>

			<SignInModal
				isOpen={isSignInModalOpen}
				onClose={() => setIsSignInModalOpen(false)}
			/>
		</div>
	);
};

export default ProductsPage;