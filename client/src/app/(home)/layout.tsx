import { AddPostButton } from "@/components/ui/AddPostButton";
import { Search } from "@/components/Search";

export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<div  className="w-full px-4 py-12">
			<div className="border-b border-slate-200 py-6">
				<h1 className="text-4xl font-serif font-bold text-slate-900">
					Our Blog & Articles
				</h1>
				<p className=" text-slate-500 mt-2">
					Fresh thoughts, deep dives, and weekly updates.
				</p>
			</div>

			<div className="py-10 flex justify-between border-b border-slate-200">
				<AddPostButton />
				<Search />
			</div>
			{children}
		</div>
	)
}
