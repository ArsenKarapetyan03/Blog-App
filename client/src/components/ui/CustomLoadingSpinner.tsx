import type { CSSProperties } from "react";

interface CustomLoadingSpinnerProps {
	description?: string;
	variant?: "solid" | "dashed" | "dots";
	size?: "sm" | "md" | "lg";
	duration?: number | string;
	colorClass?: string;
}

const SIZES = {
	sm: {
		spinner: "size-6",
		dot: "size-2",
		borderSpinner: "h-6 w-6 border-2",
		text: "text-sm",
		gap: "gap-2",
	},
	md: {
		spinner: "size-10",
		dot: "size-3",
		borderSpinner: "h-10 w-10 border-3",
		text: "text-base",
		gap: "gap-3",
	},
	lg: {
		spinner: "size-16",
		dot: "size-5",
		borderSpinner: "h-14 w-14 border-5",
		text: "text-lg",
		gap: "gap-4",
	},
};

export const CustomLoadingSpinner = (
	{
		description,
		variant = "dots",
		size = "md",
		duration = "infinite",
		colorClass = "text-blue-500",
	}: CustomLoadingSpinnerProps
) => {

	const animationStyle = { animationIterationCount: duration };

	return (
		<div
			className={`flex flex-col items-center justify-center ${SIZES[size].gap} ${colorClass}`}
			style={{ "--spinner-color": "currentColor" } as CSSProperties}
		>
			{variant === "dots" ? (
				<div
					className={`relative animate-spin ${SIZES[size].spinner}`}
					style={animationStyle}
				>
					<div className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full ${SIZES[size].dot}`} style={{ backgroundColor: "var(--spinner-color)", opacity: 0.3 }} />
					<div className={`absolute top-1/2 right-0 -translate-y-1/2 rounded-full ${SIZES[size].dot}`} style={{ backgroundColor: "var(--spinner-color)", opacity: 0.6 }} />
					<div className={`absolute top-1/2 left-0 -translate-y-1/2 rounded-full ${SIZES[size].dot}`} style={{ backgroundColor: "var(--spinner-color)", opacity: 0.8 }} />
					<div className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full ${SIZES[size].dot}`} style={{ backgroundColor: "var(--spinner-color)" }} />
				</div>
			) : (
				<div
					className={`
						rounded-full animate-spin
						${SIZES[size].borderSpinner} 
						${variant === "dashed" ? "border-dashed" : "border-solid"} 
					`}
					style={{
						...animationStyle,
						borderColor: variant === "dashed" ? "var(--spinner-color)" : "transparent",
						borderTopColor: variant === "solid" ? "var(--spinner-color)" : undefined,
						borderRightColor: variant === "solid" ? "var(--spinner-color)" : undefined,
					}}
				/>
			)}

			{description && (
				<p className={`font-medium ${SIZES[size].text}`}>
					{description}
				</p>
			)}
		</div>
	);
};