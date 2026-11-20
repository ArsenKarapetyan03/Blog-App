"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Drawer } from "antd";
import { createCheckoutSession } from "@/actions/product";
import { CartItem, type Price, type Product } from "@/types/types";
import { SignInModal } from "@/components/ui/SignInModal";
import { useAuth } from "@/context/useAuth";
import { useNotification } from "@/context/NotificationProvider";

interface CartContextType {
	cart: CartItem[];
	totalItems: number;
	openCart: () => void;
	closeCart: () => void;
	addToCart: (product: Product, selectedPrice?: Price) => void;
	clearCart: () => void;
	buyNow: (priceId: number | string, quantity?: number) => Promise<void>;
	buyingPriceId: number | string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({	children }) => {
	const { isAuthenticated } = useAuth();
	const notification = useNotification();

	const [cart, setCart] = useState<CartItem[]>([]);
	const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);
	const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
	const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
	const [buyingPriceId, setBuyingPriceId] = useState<number | string | null>(
		null
	);
	const [isCheckingOutCart, setIsCheckingOutCart] = useState<boolean>(false);

	useEffect(() => {
		try {
			const savedCart = localStorage.getItem("shopping_cart");
			if (savedCart) {
				setCart(JSON.parse(savedCart));
			}
		} catch (e) {
			console.warn("Failed to load cart from storage", e);
		} finally {
			setIsCartLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (!isCartLoaded) return;
		try {
			localStorage.setItem("shopping_cart", JSON.stringify(cart));
		} catch (e) {
			console.warn("Failed to save cart to storage", e);
		}
	}, [cart, isCartLoaded]);

	const showErrorNotification = (description: string) => {
		notification.error({
			title: "Error",
			description,
			placement: "topRight",
		});
	};

	const addToCart = (product: Product, selectedPrice?: Price) => {
		const targetPrice = selectedPrice || product.Prices?.[0];
		if (!targetPrice) return;

		setCart((prevCart) => {
			const existingIndex = prevCart.findIndex(
				(item) => item.priceId === targetPrice.id
			);

			if (existingIndex > -1) {
				const updated = [...prevCart];
				updated[existingIndex] = {
					...updated[existingIndex],
					quantity: updated[existingIndex].quantity + 1,
				};
				return updated;
			}

			return [
				...prevCart,
				{
					productId: product.id,
					priceId: targetPrice.id,
					name: product.name,
					unitAmount: targetPrice.unitAmount,
					currency: targetPrice.currency,
					quantity: 1,
				},
			];
		});

		notification.success({
			title: "Added to Cart",
			description: `${product.name} has been added to your cart.`,
			placement: "topRight",
			duration: 2,
		});
	};

	const clearCart = () => {
		setCart([]);
		try {
			localStorage.removeItem("shopping_cart");
		} catch (e) {
			console.warn("Failed to clear cart from storage", e);
		}
	};

	const buyNow = async (priceId: number | string, quantity: number = 1) => {
		if (!isAuthenticated) {
			setIsSignInModalOpen(true);
			return;
		}

		setBuyingPriceId(priceId);
		const result = await createCheckoutSession([{ priceId, quantity }]);

		if (!result.success || !result.url) {
			showErrorNotification(result.message || "Failed to start checkout.");
			setBuyingPriceId(null);
			return;
		}

		window.location.href = result.url;
	};

	const handleCartCheckout = async () => {
		if (!isAuthenticated) {
			setIsSignInModalOpen(true);
			return;
		}

		if (cart.length === 0) {
			showErrorNotification("Your cart is empty.");
			return;
		}

		setIsCheckingOutCart(true);

		const items = cart.map((item) => ({
			priceId: item.priceId,
			quantity: item.quantity,
		}));

		const result = await createCheckoutSession(items);

		if (!result.success || !result.url) {
			showErrorNotification(result.message || "Failed to start checkout.");
			setIsCheckingOutCart(false);
			return;
		}

		window.location.href = result.url;
	};

	const updateQuantity = (priceId: string | number, delta: number) => {
		setCart((prevCart) =>
			prevCart
				.map((item) =>
					item.priceId === priceId
						? { ...item, quantity: Math.max(0, item.quantity + delta) }
						: item
				)
				.filter((item) => item.quantity > 0)
		);
	};

	const removeFromCart = (priceId: string | number) => {
		setCart((prevCart) => prevCart.filter((item) => item.priceId !== priceId));
	};

	const formatPrice = (amount?: number, currency: string = "usd") => {
		if (amount === undefined || amount === null) return null;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
	const cartTotalAmount = cart.reduce(
		(sum, item) => sum + item.unitAmount * item.quantity,
		0
	);
	const cartCurrency = cart[0]?.currency || "usd";

	return (
		<CartContext.Provider
			value={{
				cart,
				totalItems,
				openCart: () => setIsCartOpen(true),
				closeCart: () => setIsCartOpen(false),
				addToCart,
				clearCart,
				buyNow,
				buyingPriceId,
			}}
		>
			{children}

			<Drawer
				title={`Shopping Cart (${totalItems})`}
				placement="right"
				open={isCartOpen}
				onClose={() => setIsCartOpen(false)}
				size={420}
				footer={
					cart.length > 0 ? (
						<div className="py-2">
							<div className="mb-4 flex items-center justify-between text-base font-bold text-gray-900">
								<span>Total</span>
								<span>{formatPrice(cartTotalAmount, cartCurrency)}</span>
							</div>

							<button
								onClick={handleCartCheckout}
								disabled={isCheckingOutCart || cart.length === 0}
								className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
							>
								{isCheckingOutCart ? "Redirecting..." : "Checkout"}
							</button>
						</div>
					) : null
				}
			>
				{cart.length === 0 ? (
					<div className="py-16 text-center text-sm text-gray-500">
						Your cart is currently empty.
					</div>
				) : (
					<div className="space-y-4">
						{cart.map((item) => (
							<div
								key={item.priceId}
								className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
							>
								<div>
									<h4 className="text-sm font-semibold text-gray-900">
										{item.name}
									</h4>
									<p className="text-xs text-gray-500">
										{formatPrice(item.unitAmount, item.currency)} each
									</p>
								</div>

								<div className="flex items-center gap-2">
									<button
										onClick={() => updateQuantity(item.priceId, -1)}
										className="h-7 w-7 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
									>
										-
									</button>
									<span className="w-6 text-center text-sm font-medium text-gray-900">
										{item.quantity}
									</span>
									<button
										onClick={() => updateQuantity(item.priceId, 1)}
										className="h-7 w-7 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
									>
										+
									</button>
									<button
										onClick={() => removeFromCart(item.priceId)}
										className="ml-2 text-xs text-red-600 hover:underline"
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</Drawer>

			<SignInModal
				isOpen={isSignInModalOpen}
				onClose={() => setIsSignInModalOpen(false)}
			/>
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};