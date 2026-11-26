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

export default function ProductForm({initialData}: ProductFormProps) {
	const router = useRouter();
	const {isAuthenticated} = useAuth();
	const notification = useNotification();

	const isEditing = Boolean(initialData);

	const oneTimePrice =
		initialData?.Prices?.find((p) => p.type === "one_time") ??
		initialData?.Prices?.[0];
	const dailyPrice = initialData?.Prices?.find((p) => p.type === "recurring" && p.interval === "day");
	const weeklyPrice = initialData?.Prices?.find((p) => p.type === "recurring" && p.interval === "week");
	const monthlyPrice = initialData?.Prices?.find((p) => p.type === "recurring" && p.interval === "month");
	const yearlyPrice = initialData?.Prices?.find((p) => p.type === "recurring" && p.interval === "year");

	const hasExistingRecurring = Boolean(dailyPrice || weeklyPrice || monthlyPrice || yearlyPrice);

	const formatCents = (cents?: number) =>
		cents !== undefined ? (cents / 100).toFixed(2) : "";

	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
	const [name, setName] = useState(initialData?.name ?? "");
	const [description, setDescription] = useState(initialData?.description ?? "");
	const [priceInDollars, setPriceInDollars] = useState(formatCents(oneTimePrice?.unitAmount));
	const [currency, setCurrency] = useState(oneTimePrice?.currency ?? "usd");
	const [allowRecurring, setAllowRecurring] = useState<boolean>(hasExistingRecurring);
	const [submitting, setSubmitting] = useState(false);

	const [dailyPriceInDollars, setDailyPriceInDollars] = useState(formatCents(dailyPrice?.unitAmount));
	const [weeklyPriceInDollars, setWeeklyPriceInDollars] = useState(formatCents(weeklyPrice?.unitAmount));
	const [monthlyPriceInDollars, setMonthlyPriceInDollars] = useState(formatCents(monthlyPrice?.unitAmount));
	const [yearlyPriceInDollars, setYearlyPriceInDollars] = useState(formatCents(yearlyPrice?.unitAmount));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isAuthenticated) {
			setIsSignInModalOpen(true);
			return;
		}

		setSubmitting(true);

		const payload = {
			...(isEditing && initialData && { productId: String(initialData.id) }),
			name,
			description,
			priceInDollars,
			currency,
			allowRecurring,
			...(allowRecurring && {
				recurringPrices: {
					day: dailyPriceInDollars.trim() || priceInDollars,
					week: weeklyPriceInDollars.trim() || priceInDollars,
					month: monthlyPriceInDollars.trim() || priceInDollars,
					year: yearlyPriceInDollars.trim() || priceInDollars,
				},
			}),
		};

		try {
			const result =
				isEditing && initialData
					? await updateProduct(payload)
					: await createProduct(payload);

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
								One-Time Price (in Dollars) *
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

					<div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
						<label className="flex cursor-pointer items-start gap-3">
							<input
								type="checkbox"
								checked={allowRecurring}
								onChange={(e) => setAllowRecurring(e.target.checked)}
								className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
							/>
							<div>
								<span className="block text-sm font-medium text-gray-900">
									Allow recurring subscriptions
								</span>
								<span className="block text-xs text-gray-500">
									Set custom prices for daily, weekly, monthly, and yearly plans, or leave blank to use the one-time price.
								</span>
							</div>
						</label>

						{allowRecurring && (
							<div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2 lg:grid-cols-4">
								<div>
									<label className="mb-1 block text-xs font-medium text-gray-700">
										Daily Price (/ day)
									</label>
									<input
										type="number"
										step="0.01"
										min="0.50"
										placeholder={priceInDollars || "20.00"}
										value={dailyPriceInDollars}
										onChange={(e) => setDailyPriceInDollars(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
									/>
								</div>

								<div>
									<label className="mb-1 block text-xs font-medium text-gray-700">
										Weekly Price (/ week)
									</label>
									<input
										type="number"
										step="0.01"
										min="0.50"
										placeholder={
											priceInDollars ? `${Number(priceInDollars) * 5}` : "20.00"
										}
										value={weeklyPriceInDollars}
										onChange={(e) => setWeeklyPriceInDollars(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
									/>
								</div>

								<div>
									<label className="mb-1 block text-xs font-medium text-gray-700">
										Monthly Price (/ month)
									</label>
									<input
										type="number"
										step="0.01"
										min="0.50"
										placeholder={
											priceInDollars ? `${Number(priceInDollars) * 20}` : "20.00"
										}
										value={monthlyPriceInDollars}
										onChange={(e) => setMonthlyPriceInDollars(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
									/>
								</div>

								<div>
									<label className="mb-1 block text-xs font-medium text-gray-700">
										Yearly Price (/ year)
									</label>
									<input
										type="number"
										step="0.01"
										min="0.50"
										placeholder={
											priceInDollars ? `${Number(priceInDollars) * 200}` : "20.00"
										}
										value={yearlyPriceInDollars}
										onChange={(e) => setYearlyPriceInDollars(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
									/>
								</div>
							</div>
						)}
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