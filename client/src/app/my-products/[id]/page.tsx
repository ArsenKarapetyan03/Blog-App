"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { useNotification } from "@/context/NotificationProvider";
import { archiveProduct, getProductById } from "@/actions/product";
import { Product } from "@/types/types";
import { formatPrice } from "@/lib/pricing";

const ProductPage = ({params}: { params: Promise<{ id: string }> }) => {
	const {id} = use(params);
	const router = useRouter();
	const notification = useNotification();

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [archiving, setArchiving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchProduct = async () => {
			setLoading(true);
			setError(null);

			const response = await getProductById(id);

			if (!isMounted) return;

			if (!response.success || !response.data) {
				setError(response.message || "Product not found.");
			} else {
				setProduct(response.data);
			}

			setLoading(false);
		};

		fetchProduct();

		return () => {
			isMounted = false;
		};
	}, [id]);

	const showArchiveConfirm = () => {
		if (!product) {
			return;
		}

		Modal.confirm({
			title: `Are you sure you want to archive "${product.name}"?`,
			content: "This action cannot be undone.",
			okText: "Archive",
			okType: "danger",
			centered: true,
			async onOk() {
				setArchiving(true);
				try {
					const result = await archiveProduct(String(product.id));

					if (!result.success) {
						notification.error({
							title: "Error",
							description: result.message || "Failed to archive product.",
							placement: "topRight",
						});
						return;
					}

					notification.success({
						title: "Product Archived",
						description: `"${product.name}" has been archived successfully.`,
						placement: "topRight",
					});

					router.push("/my-products");
					router.refresh();
				} finally {
					setArchiving(false);
				}
			},
		});
	};

	if (loading) {
		return (
			<div className="max-w-5xl mx-auto p-6 space-y-6 animate-pulse">
				<div className="h-8 bg-slate-200 dark:bg-gray-800 rounded-md w-1/3"/>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 h-64 bg-slate-200 dark:bg-gray-800 rounded-2xl"/>
					<div className="h-64 bg-slate-200 dark:bg-gray-800 rounded-2xl"/>
				</div>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div
				className="max-w-xl mx-auto my-16 p-8 text-center border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20 rounded-2xl space-y-4">
				<div
					className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-lg">
					!
				</div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
					{error || "Product not found"}
				</h2>
				<p className="text-sm text-slate-500 dark:text-gray-400">
					The product you are looking for may have been removed or does not exist.
				</p>
				<Link
					href="/my-products"
					className="inline-block mt-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition"
				>
					Back to My Products
				</Link>
			</div>
		);
	}

	const activePrice = product.Prices?.[0];
	const tariffs = product.Prices?.slice(1) ?? [];

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-6">
			<div
				className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
							{product.name}
						</h1>
						<span
							className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${
								product.active
									? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400"
									: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-gray-800 dark:text-gray-400"
							}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									product.active ? "bg-emerald-500" : "bg-slate-400"
								}`}
							/>
							{product.active ? "Active" : "Archived"}
						</span>
					</div>
				</div>

				{product.active && (
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => router.push(`/my-products/${product.id}/edit`)}
							className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
						>
							Edit
						</button>
						<button
							type="button"
							disabled={archiving}
							onClick={showArchiveConfirm}
							className="rounded-lg bg-red-50 dark:bg-red-950/50 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 cursor-pointer"
						>
							{archiving ? "Archiving..." : "Archive"}
						</button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-6">
					<div
						className="p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
							Current Price
						</span>
						{activePrice ? (
							<div className="mt-2 flex items-baseline gap-2">
								<span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
									{formatPrice(activePrice.unitAmount, activePrice.currency)}
								</span>
								<span
									className="px-2 py-0.5 text-xs font-semibold uppercase rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
									{activePrice.currency}
								</span>
							</div>
						) : (
							<p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
								No active price configured for this product.
							</p>
						)}
					</div>

					<div
						className="p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
						<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
							Description
						</h2>
						<p className="text-sm leading-relaxed text-slate-600 dark:text-gray-400 whitespace-pre-line">
							{product.description || "No description provided for this product."}
						</p>
					</div>
				</div>

				<div
					className="p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-900/60 space-y-5 h-fit">
					<h2
						className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-gray-800 pb-3">
						Product Details
					</h2>

					<dl className="space-y-4 text-sm">
						<div>
							<dt className="text-xs font-medium text-slate-400">Internal ID</dt>
							<dd className="mt-1 font-mono text-slate-800 dark:text-gray-200">
								#{product.id}
							</dd>
						</div>

						{product.shippingInterval && (
							<div>
								<dt className="text-xs font-medium text-slate-400">
									Shipping Interval
								</dt>
								<dd className="mt-1 font-medium text-slate-800 dark:text-gray-200">
									Every {product.shippingInterval}
								</dd>
							</div>
						)}

						<div className="pt-3 border-t border-slate-200 dark:border-gray-800 grid grid-cols-2 gap-2">
							<div>
								<dt className="text-xs font-medium text-slate-400">Created</dt>
								<dd className="mt-1 text-xs text-slate-700 dark:text-gray-300">
									{new Date(product.createdAt).toLocaleDateString()}
								</dd>
							</div>
							<div>
								<dt className="text-xs font-medium text-slate-400">Updated</dt>
								<dd className="mt-1 text-xs text-slate-700 dark:text-gray-300">
									{new Date(product.updatedAt).toLocaleDateString()}
								</dd>
							</div>
						</div>
					</dl>
				</div>
			</div>

			<div
				className="p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-slate-900 dark:text-white">
						Tariffs
					</h2>
					<span className="text-xs text-slate-400">
						{tariffs.length} {tariffs.length === 1 ? "plan" : "plans"}
					</span>
				</div>

				{tariffs.length > 0 ? (
					<div className="flex flex-nowrap gap-4 overflow-x-auto pb-1">
						{tariffs.map((price) => (
							<div
								key={price.id}
								className="min-w-55 flex-1 p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-800/40 flex flex-col justify-between space-y-3"
							>
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-semibold text-slate-700 dark:text-gray-200">
										{price.interval}
									</span>
									<span
										className="px-2 py-0.5 text-[11px] font-semibold uppercase rounded bg-slate-200/70 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
										{price.currency}
									</span>
								</div>

								<div className="flex items-baseline gap-1.5">
									<span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
										{formatPrice(price.unitAmount, price.currency)}
									</span>
									{price.interval && (
										<span className="text-xs text-slate-500 dark:text-gray-400">
											/ {price.interval}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-slate-500 dark:text-gray-400">
						No tariffs configured for this product.
					</p>
				)}
			</div>
		</div>
	);
};

export default ProductPage;