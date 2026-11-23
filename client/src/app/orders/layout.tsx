import { CartProvider } from "@/context/CartContext";
import { BackButton } from "@/components/ui/BackButton";
import { HeaderLink } from "@/components/Header/HeaderLink";
import { cookies } from "next/headers";

export default async function RootLayout({children}: LayoutProps<"/">) {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	const isAuthenticated = !!token;

	return (
		<div className="w-full px-4 py-12">
			<div className="mb-4">
				<BackButton label="Back" useHistory />
			</div>

			<div className="mb-8 border-b border-slate-200 pb-6">
				<h1 className="text-4xl font-serif font-bold text-slate-900">
					My Orders
				</h1>
				<p className=" text-slate-500 mt-2">
					Track your active shipments and view your past purchases.
				</p>
			</div>

			<div className="mt-8">
				{isAuthenticated
					? <CartProvider>{children}</CartProvider>
					: <div className="flex flex-col items-center gap-5">
						<div className="text-3xl font-semibold">Sign in to continue.</div>
						<HeaderLink text="Sign in" href="/sign-in" />
					</div>
				}
			</div>
		</div>
	)
}