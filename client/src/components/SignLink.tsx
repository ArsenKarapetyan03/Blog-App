import Link from "next/link";

export const SignLink = ({text, href}: {text: string, href: string}) => (
	<Link href={href} className="bg-black text-white p-2 rounded-2xl">
		{text}
	</Link>
)