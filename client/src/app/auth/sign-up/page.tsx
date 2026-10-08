import Link from "next/link";

const SignInPage = async () => {

	return (
		<main className="h-full w-full bg-white flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<h1 className="text-4xl font-semibold tracking-tight text-gray-900">Welcome</h1>
					<p className="mt-2 text-gray-500">Create an account to continue</p>
				</div>

				<form className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="mb-2 block font-medium text-gray-700"
						>
							Name
						</label>

						<input
							id="name"
							type="name"
							placeholder="Your Name"
							required={true}
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
						/>
					</div>

					<div>
						<label
							htmlFor="email"
							className="mb-2 block font-medium text-gray-700"
						>
							Email
						</label>

						<input
							id="email"
							type="email"
							placeholder="you@example.com"
							required={true}
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label
								htmlFor="password"
								className=" font-medium text-gray-700"
							>
								Password
							</label>
						</div>

						<input
							id="password"
							type="password"
							placeholder="••••••••"
							required={true}
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
						/>
					</div>

					<button
						type="submit"
						className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]"
					>
						Create
					</button>
				</form>

				<div className="my-6 flex items-center gap-4">
					<div className="h-px flex-1 bg-gray-200" />
					<div className="h-px flex-1 bg-gray-200" />
				</div>

				<p className="mt-8 text-center text-gray-500">
					<span>Have an account? </span>
					<Link
						href="/auth/sign-in"
						className="font-medium text-gray-900 hover:underline"
					>
						Sign in
					</Link>
				</p>

				<p className="mt-6 text-center text-xs leading-5 text-gray-400">
					<span>By continuing, you agree to our </span>
					<a href="#" className="underline hover:text-gray-600">Terms</a>
					<span> and </span>
					<a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
					.
				</p>
			</div>
		</main>
	);
}

export default SignInPage;