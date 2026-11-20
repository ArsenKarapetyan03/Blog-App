"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationProvider";
import { SignInModal } from "@/components/ui/SignInModal";
import { createProduct, updateProduct } from "@/actions/product";
import { useAuth } from "@/context/useAuth";
import { Product } from "@/types/types";

interface ProductFormProps {
	initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const notification = useNotification();

	const isEditing = Boolean(initialData);
	const defaultPrice = initialData?.Prices?.[0];

	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
	const [name, setName] = useState(initialData?.name ?? "");
	const [description, setDescription] = useState(initialData?.description ?? "");
	const [priceInDollars, setPriceInDollars] = useState(
		defaultPrice?.unitAmount ? (defaultPrice.unitAmount / 100).toFixed(2) : ""
	);
	const [currency, setCurrency] = useState(defaultPrice?.currency ?? "usd");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isAuthenticated) {
			setIsSignInModalOpen(true);
			return;
		}

		setSubmitting(true);

		try {
			const result = isEditing && initialData
				? await updateProduct(String(initialData.id), {
					name,
					description,
					priceInDollars,
					currency,
				})
				: await createProduct({
					name,
					description,
					priceInDollars,
					currency,
				});

			if (!result.success) {
				notification.error({
					title: "Error",
					description:
						result.message ||
						`Failed to ${isEditing ? "update" : "create"} product.`,
					placement: "topRight",
				});
				return;
			}

			notification.success({
				title: isEditing ? "Product Updated" : "Product Created",
				description: `"${name}" has been ${
					isEditing ? "updated" : "created"
				} successfully.`,
				placement: "topRight",
			});

			router.push("/my-products");
			router.refresh();
		} catch (err) {
			notification.error({
				title: "Unexpected Error",
				description: "Something went wrong. Please try again.",
				placement: "topRight",
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="w-full">
			<section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-lg font-semibold text-gray-900">
					{isEditing ? "Edit Product" : "Create New Product"}
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Product Name *
						</label>
						<input
							type="text"
							placeholder="Required"
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

					<div className="flex items-center gap-3 pt-2">
						<button
							type="submit"
							disabled={submitting}
							className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
						>
							{submitting
								? isEditing
									? "Saving..."
									: "Creating..."
								: isEditing
									? "Save Changes"
									: "Create Product"}
						</button>

						{isEditing && (
							<button
								type="button"
								onClick={() => router.back()}
								className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
						)}
					</div>
				</form>
			</section>
			<SignInModal
				isOpen={isSignInModalOpen}
				onClose={() => setIsSignInModalOpen(false)}
			/>
		</div>
	);
}