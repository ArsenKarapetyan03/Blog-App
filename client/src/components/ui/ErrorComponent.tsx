"use client";

import Link from "next/link";

export const ErrorComponent = () => {
	return (
		<div className="my-10 w-full min-w-2xl rounded-xl border border-red-200 bg-red-50 p-5 flex flex-col gap-4">
			<h3 className="text-red-800 font-semibold">
				Can't get data
			</h3>

			<div>
				<Link
					href="/"
					className="inline-block px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition text-center"
				>
					Go to Homepage
				</Link>
			</div>
		</div>
	);
};
