import type { ReactNode } from "react"
import { cookies } from "next/headers";
import { HeaderLink } from "@/components/Header/HeaderLink";
import { WebSocketProvider } from "@/context/webSocketContext";

export default async function MessagesLayout({children}: { children: ReactNode }) {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	const isAuthenticated = !!token;

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
				{isAuthenticated
					? <WebSocketProvider token={token}>
								{children}
						</WebSocketProvider>
					: <div className="flex flex-col items-center gap-5">
							<div className="text-3xl font-semibold">Sign in to continue.</div>
							<HeaderLink text="Sign in" href="/sign-in" />
						</div>
				}
			</div>
		</div>
	)
}
