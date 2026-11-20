import { ReactNode } from "react";
import { BackButton } from "@/components/ui/BackButton";

export default async function MessagesLayout({ children }: { children: ReactNode }) {

	return (
		<div className="flex flex-col gap-4 w-full px-4 py-12">
			{children}
		</div>
	)
}
