import { CartProvider } from "@/context/CartContext";
import { BackButton } from "@/components/ui/BackButton";
import { HeaderLink } from "@/components/Header/HeaderLink";
import { cookies } from "next/headers";
import React from "react";

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
					Subscriptions
				</h1>
				<p className=" text-slate-500 mt-2">
					Manage your active plans and billing cycles.
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