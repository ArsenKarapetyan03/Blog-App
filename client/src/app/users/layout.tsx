export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<div className="w-full px-4 py-12">
			<div className="border-b border-slate-200 py-6">
				<h1 className="text-4xl font-serif font-bold text-slate-900">
					Authors
				</h1>
				<p className=" text-slate-500 mt-2">
					Discover and connect with our community writers.
				</p>
			</div>
			{children}
		</div>
	)
}
