import { cookies } from "next/headers";
import { HeaderLink } from "./HeaderLink";
import { LogoutButton } from "@/components/ui/LogoutButton";

export const Header = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;
	const isAuthenticated = !!token;

	return(
		<header className="flex justify-between p-5">
			<div className="flex items-center gap-5">
				<HeaderLink text="Home" href="/" />
				<HeaderLink text="Users" href="/users" />
			</div>

			{!isAuthenticated
				? <div className="flex gap-4">
						<HeaderLink text="Sign up" href="/sign-up" />
						<HeaderLink text="Sign in" href="/sign-in" />
					</div>
				: <LogoutButton />
			}
			</header>
	)
};