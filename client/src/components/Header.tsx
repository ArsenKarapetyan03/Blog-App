import Link from "next/link";

const Header = () => {
	return (
		<div className="flex justify-center bg-zinc-200">
			<nav className="w-full max-w-4xl flex gap-5 p-4 text-2xl font-semibold">
				<Link href="/">Home</Link>
			</nav>
		</div>
	)
}

export default Header;