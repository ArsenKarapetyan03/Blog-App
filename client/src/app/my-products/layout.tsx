import { BackButton } from "@/components/ui/BackButton";

export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<div className="w-full px-4 py-12">
			<div className="mb-4">
				<BackButton href="/products" label="Back to Products" />
			</div>

			<div className="mb-8 border-b border-slate-200 pb-6">
				<h1 className="text-3xl font-bold tracking-tight text-slate-900">
					My Products
				</h1>
				<p className="mt-2 text-sm text-slate-500">
					View and manage your purchased items and active subscriptions.
				</p>
			</div>
			{children}
		</div>
	)
}