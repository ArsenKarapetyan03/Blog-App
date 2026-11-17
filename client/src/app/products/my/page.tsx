"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/config/api";

interface Price {
	id: number | string;
	unitAmount: number; // stored in cents
	currency: string;
	active: boolean;
}

interface Product {
	id: number | string;
	name: string;
	description: string | null;
	active: boolean;
	Prices?: Price[]; // Adjust to `prices?: Price[]` depending on your Sequelize association alias
}

const ProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [priceInDollars, setPriceInDollars] = useState("");
	const [currency, setCurrency] = useState("usd");
	const [submitting, setSubmitting] = useState(false);
	const [buyingPriceId, setBuyingPriceId] = useState<number | string | null>(null);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${BASE_URL}/products`, {
				credentials: "include",
			});

			if (!res.ok) {
				throw new Error("Failed to load products");
			}

			const data = await res.json();
			setProducts(data.products || data);
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	// 2. Create a new product
	const handleCreateProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const dollarValue = parseFloat(priceInDollars);
		if (!name.trim() || isNaN(dollarValue) || dollarValue <= 0) {
			setError("Please enter a valid product name and positive price.");
			return;
		}

		// Convert dollars (e.g., 19.99) to cents (1999) for Stripe
		const unitAmount = Math.round(dollarValue * 100);

		try {
			setSubmitting(true);
			const res = await fetch(`${BASE_URL}/products`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || undefined,
					unitAmount,
					currency,
				}),
			});

			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to create product");
			}

			setName("");
			setDescription("");
			setPriceInDollars("");
			await fetchProducts();
		} catch (err: any) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	// 3. Trigger Stripe Checkout for a product's price
	const handleCheckout = async (priceId: number | string) => {
		try {
			setBuyingPriceId(priceId);
			setError(null);

			const res = await fetch(`${BASE_URL}/checkout/session`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					priceId,
					quantity: 1,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to start checkout session");
			}

			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err: any) {
			setError(err.message);
			setBuyingPriceId(null);
		}
	};

	const formatPrice = (cents: number, curr: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: curr.toUpperCase(),
		}).format(cents / 100);
	};

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					My Products
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Create products synced with Stripe and test your checkout flow.
				</p>
			</div>

			{error && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			)}

			{/* Create New Product Form */}
			<section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-lg font-semibold text-gray-900">
					Create New Product
				</h2>
				<form onSubmit={handleCreateProduct} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Product Name *
						</label>
						<input
							type="text"
							placeholder="e.g., Pro Plan"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							placeholder="Optional product description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div className="sm:col-span-2">
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Price (in Dollars) *
							</label>
							<input
								type="number"
								step="0.01"
								min="0.50"
								placeholder="20.00"
								value={priceInDollars}
								onChange={(e) => setPriceInDollars(e.target.value)}
								required
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
							/>
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								Currency
							</label>
							<select
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
							>
								<option value="usd">USD ($)</option>
								<option value="eur">EUR (€)</option>
								<option value="gbp">GBP (£)</option>
							</select>
						</div>
					</div>

					<div className="pt-2">
						<button
							type="submit"
							disabled={submitting}
							className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
						>
							{submitting ? "Creating..." : "Create Product"}
						</button>
					</div>
				</form>
			</section>

			{/* Current User's Products List */}
			<section>
				<h2 className="mb-4 text-lg font-semibold text-gray-900">
					Your Product Catalog
				</h2>

				{loading ? (
					<div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
						Loading products...
					</div>
				) : products.length === 0 ? (
					<div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
						You haven't created any products yet. Use the form above to add your first one.
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
												<span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
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
		</div>
	);
};

export default ProductsPage;