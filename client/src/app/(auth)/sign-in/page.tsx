"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { signIn } from "@/actions/auth";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";

const initialState = { success: false, message: "" };

const LoginPage = () => {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(signIn, initialState);

	useEffect(() => {
		if (state?.success) {
			router.push("/");
			router.refresh();
		}
	}, [state?.success, router]);

	return (
		<main className="h-full w-full bg-white flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<h1 className="text-4xl font-semibold tracking-tight text-gray-900">
						Welcome back
					</h1>
					<p className="mt-2 text-gray-500">
						Log in to continue to your account
					</p>
				</div>

				<form
					action={formAction}
					className="space-y-4"
				>
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
							name="email"
							placeholder="you@example.com"
							required
							autoComplete="email"
							disabled={isPending}
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition
							 placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:opacity-60"
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label
								htmlFor="password"
								className="font-medium text-gray-700"
							>
								Password
							</label>
						</div>

						<input
							id="password"
							type="password"
							name="password"
							placeholder="••••••••"
							required
							disabled={isPending}
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition
							 placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:opacity-60"
						/>
					</div>

					{state?.message && !state.success && (
						<p className="text-sm text-red-600 font-medium text-center bg-red-50 p-2.5 rounded-lg border border-red-100">
							{state.message}
						</p>
					)}

					<button
						type="submit"
						disabled={isPending}
						className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800
						 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
					>
						{isPending ? (
							<>
								<CustomLoadingSpinner size="sm"/> Wait...
							</>
						) : (
							"Sign in"
						)}
					</button>
				</form>

				<div className="my-6 h-px bg-gray-200" />

				<p className="mt-8 text-center text-gray-500">
					<span>Don't have an account? </span>
					<Link
						href="/sign-up"
						className="font-medium text-gray-900 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</main>
	);
}

export default LoginPage;
