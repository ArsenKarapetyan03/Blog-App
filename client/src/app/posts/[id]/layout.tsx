import { BackButton } from "@/components/ui/BackButton";

export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<div className="flex flex-col gap-10 w-full px-4 py-20">
			<BackButton />
			{children}
		</div>
	)
}