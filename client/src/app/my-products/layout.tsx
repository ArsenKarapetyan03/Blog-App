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
				<BackButton useHistory label="Back to Products" />
			</div>

			<div className="mb-8 border-b border-slate-200 pb-6">
				<h1 className="text-3xl font-bold tracking-tight text-slate-900">
					My Products
				</h1>
				<p className="mt-2 text-sm text-slate-500">
					View and manage your purchased items and active subscriptions.
				</p>
			</div>

			{isAuthenticated
				? children
		 		: <div className="flex flex-col items-center gap-5">
							<div className="text-3xl font-semibold">Sign in to continue.</div>
							<HeaderLink text="Sign in" href="/sign-in" />
				</div>
			}
		</div>
	)
}