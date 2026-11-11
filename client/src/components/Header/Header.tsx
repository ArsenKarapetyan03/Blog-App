"use client";

import { HeaderLink } from "./HeaderLink";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { InfoRow } from "@/components/ui/InfoRow";
import { useAuth } from "@/context/useAuth";

export const Header = () => {
	const { user } = useAuth();
	const isAuthenticated = !!user;

	return(
		<header className="lg:max-w-2/3 mx-auto flex justify-between p-5">
			<div className="flex items-center gap-5">
				<HeaderLink text="Home" href="/" />
				<HeaderLink text="Authors" href="/users" />
				{isAuthenticated && <HeaderLink text="Messages" href="/messages" />}
			</div>

			{!isAuthenticated
				? <div className="flex gap-4">
						<HeaderLink text="Sign up" href="/sign-up" />
						<HeaderLink text="Sign in" href="/sign-in" />
					</div>
				: <div className="flex gap-4">
						<InfoRow name={user.name} />
						<LogoutButton />
					</div>
			}
			</header>
	)
};