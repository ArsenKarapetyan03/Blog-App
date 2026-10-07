import Link from "next/link";

export const SignLink = (text: string) => (
	<Link href="/auth/sign-in" className="bg-black text-white">
		{text}
	</Link>
)