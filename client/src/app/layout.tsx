import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header/Header";
import { AuthProvider} from "@/context/useAuth";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({children}: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body>
				<AuthProvider>
					<Header />
					<div className="flex flex-col items-center">
						<main className="flex flex-1 w-full max-w-3xl lg:max-w-4xl flex-col items-center sm:items-start font-sans lg:text-lg">
							{children}
						</main>
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
