"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";

interface BackButtonProps {
	href?: string;
	label?: string;
	useHistory?: boolean;
}

export const BackButton = (
	{
		href,
		label,
		useHistory = false,
	}: BackButtonProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const segments = pathname.split("/").filter(Boolean);
	const defaultParent =
		segments.length > 1 ? `/${segments.slice(0, -1).join("/")}` : "/";

	const targetHref = href ?? defaultParent;

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (!useHistory) return;

		e.preventDefault();

		if (window.history.length > 1) {
			router.back();
		} else {
			router.push(targetHref);
		}
	};

	return (
		<Link
			href={targetHref}
			onClick={handleClick}
			className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
		>
			<MoveLeft className="group-hover:-translate-x-1 transition duration-200"/>
			{label}
		</Link>
	);
};