import { SignLink } from "@/components/SignLink";
import { HomeLink } from "@/components/ui/HomeLink";

export const Header = () =>
	 (
		 <header className="flex justify-between p-5">
			 <HomeLink />

			 <div className="flex gap-4">
				 <SignLink text="Sign Up" href="/auth/sign-up" />
				 <SignLink text="Sign In" href="/auth/sign-in" />
			 </div>
		 </header>
	)