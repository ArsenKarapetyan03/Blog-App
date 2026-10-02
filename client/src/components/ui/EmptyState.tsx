import { cn } from "@/utils/cn";
import { FolderOpenDot, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
	message?: string;
	icon?: LucideIcon;
	className?: string;
}

export const EmptyState = (
	{
		message = "No data",
		icon: Icon = FolderOpenDot,
		className,
		...props
	}: EmptyStateProps) => {
	return (
		<div
			{...props}
			className={cn("flex flex-col items-center justify-center max-w-7xl", className)}
		>
			<Icon size={64} strokeWidth={1} />
			<span>{message}</span>
		</div>
	)
}