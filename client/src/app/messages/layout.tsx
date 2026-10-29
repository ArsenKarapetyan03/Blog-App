import type { ReactNode } from "react"

export default function MessagesLayout({children}: { children: ReactNode }) {
	return (
		<div className="w-full px-4 py-12">
			<div className="border-b border-slate-200 py-6">
				<h1 className="text-4xl font-serif font-bold text-slate-900">
					Messages
				</h1>
				<p className="text-slate-500 mt-2">
					View your ongoing conversations and connect with others.
				</p>
			</div>

			<div className="mt-8">
				{children}
			</div>
		</div>
	)
}
