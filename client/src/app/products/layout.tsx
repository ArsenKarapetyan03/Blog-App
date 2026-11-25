import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { CartProvider } from "@/context/CartContext";
import { CartButton } from "@/components/ui/CartButton";

export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	const isAuthenticated = !!token;

	return (
		<CartProvider>
			<div className="w-full px-4 py-12">
				<div className="mb-4">
					<BackButton label="Back" />
				</div>

				<div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-center">
					<div>
						<h1 className="text-4xl font-serif font-bold text-slate-900">
							Products
						</h1>
						<p className="mt-2 text-slate-500">
							Pick your favorites and add them to your cart.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{isAuthenticated && (
							<Link
								href="/my-products"
								className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
							>
								My products
							</Link>
						)}

						<CartButton />
					</div>
				</div>

				{children}
			</div>
		</CartProvider>
	);
}