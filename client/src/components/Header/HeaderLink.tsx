import Link from "next/link";

export const HeaderLink = ({text, href}: { text: string, href: string }) => (
	<Link
		href={href}
		className="bg-black text-white p-2 rounded-lg transition hover:text-indigo-200 hover:bg-gray-800 active:scale-98"
	>
		{text}
	</Link>
)