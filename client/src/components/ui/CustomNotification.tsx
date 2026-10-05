import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { cn } from "../lib/utils.ts";
import { X } from "lucide-react";
import { Teleport } from "../hooks/Teleport.tsx";

interface CustomNotificationProps {
	message: {
		title: string;
		content: string;
	};
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	type?: "info" | "success" | "warning" | "error";
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	autoClose?: boolean;
	duration?: number;
}

const TYPE_STYLES = {
	info: {
		container: "border-blue-200 bg-blue-50 text-blue-900",
		icon: "bg-blue-100 text-blue-600",
	},
	success: {
		container: "border-green-200 bg-green-50 text-green-900",
		icon: "bg-green-100 text-green-600",
	},
	warning: {
		container: "border-yellow-200 bg-yellow-50 text-yellow-900",
		icon: "bg-yellow-100 text-yellow-600",
	},
	error: {
		container: "border-red-200 bg-red-50 text-red-900",
		icon: "bg-red-100 text-red-600",
	},
};

const TYPE_ICONS = {
	info: "i",
	success: "✓",
	warning: "!",
	error: "×",
};

const POSITION_STYLES = {
	"top-left": "top-4 left-4",
	"top-right": "top-4 right-4",
	"bottom-left": "bottom-4 left-4",
	"bottom-right": "bottom-4 right-4"
};

export const CustomNotification = (
	{
		message,
		open,
		setOpen,
		type = "info",
		position = "top-right",
		autoClose = true,
		duration = 4000,
	}: CustomNotificationProps) => {

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (autoClose && open) {
			timerRef.current = setTimeout(() => {
				setOpen(false);
			}, duration);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [autoClose, duration, open]);

	const handleCloseButton = () => {
		setOpen(false);

		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}
	}

	if (!open) return null;

	return (
		<Teleport>
			<div className={cn(
				"fixed z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border shadow-lg ",
				"animate-in fade-in slide-in-from-top-2 duration-200",
				POSITION_STYLES[position],
				TYPE_STYLES[type].container,
			)}
			>
				<div className="flex items-start gap-3 p-4">
					{/* Icon */}
					<div
						className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold", TYPE_STYLES[type].icon)}>
						{TYPE_ICONS[type]}
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1">
						<div className="font-semibold">
							{message.title}
						</div>

						<div className="mt-1 text-sm opacity-80">
							{message.content}
						</div>
					</div>

					{/* Close button */}
					<button
						type="button"
						className={
							"shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 " +
							"focus:outline-none focus:ring-2 focus:ring-current"
						}
						onClick={handleCloseButton}
					>
						<X/>
					</button>
				</div>

				{/* Progress bar */}
				{autoClose && (
					<div
						className="h-1 overflow-hidden rounded-b-lg"
						aria-hidden="true"
					>
						<div
							className={"h-full bg-current opacity-30 animate-progress"}
							style={{animationDuration: `${duration}ms`}}
						/>
					</div>
				)}
			</div>
		</Teleport>
	);
};
