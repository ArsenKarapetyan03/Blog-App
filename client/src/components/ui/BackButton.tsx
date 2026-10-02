import Link from "next/link";
import { MoveLeft } from "lucide-react";

export const BackButton = () => {
	return (
		<Link
			href="/"
			className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
		>
			<MoveLeft className="group-hover:-translate-x-1 transition duration-200"/>
			Back to blog
		</Link>
	)
}