"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoveLeft } from "lucide-react";

interface BackButtonProps {
	href?: string;
	label?: string;
}

export const BackButton = ({ href, label }: BackButtonProps) => {
	const pathname = usePathname();

	const segments = pathname.split("/").filter(Boolean);
	const defaultParent =
		segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : "/";

	return (
		<Link
			href={href ?? defaultParent}
			className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
		>
			<MoveLeft className="group-hover:-translate-x-1 transition duration-200" />
			{label}
		</Link>
	);
};