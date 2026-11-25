"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
	const { openCart, totalItems } = useCart();

	return (
		<button
			onClick={openCart}
			className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
		>
			<ShoppingCart size={16} />
			<span>Cart</span>
			{totalItems > 0 && (
				<span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
					{totalItems}
				</span>
			)}
		</button>
	);
}