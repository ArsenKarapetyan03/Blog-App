import { HeaderLink } from "./HeaderLink";

export const Header = () =>
	 (
		 <header className="flex justify-between p-5">
			 <HeaderLink text="Home" href="/" />

			 <div className="flex gap-4">
				 <HeaderLink text="Register" href="/register" />
				 <HeaderLink text="Login" href="/login" />
			 </div>
		 </header>
	)