import { CartProvider } from "@/context/CartContext";
import { BackButton } from "@/components/ui/BackButton";

export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<div className="w-full px-4 py-12">
			<div className="mb-4">
				<BackButton label="Back" />
			</div>

			<div className="mb-8 border-b border-slate-200 pb-6">
				<h1 className="text-4xl font-serif font-bold text-slate-900">
					Products
				</h1>
				<p className=" text-slate-500 mt-2">
					Pick your favorites and add them to your cart.
				</p>
			</div>

			<CartProvider>{children}</CartProvider>
		</div>
	)
}