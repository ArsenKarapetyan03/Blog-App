"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationButton } from "@/components/Pagination/PaginationButton";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
}

export const Pagination = (
	{
		currentPage,
		totalPages,
	}: PaginationProps
) => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const {replace} = useRouter();

	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) {
			return;
		}

		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page));
		replace(`${pathname}?${params.toString()}`);
	}

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex justify-center gap-5">
			<PaginationButton
				text="previous"
				disabled={currentPage === 1}
				onClick={() => handlePageChange(currentPage - 1)}
			/>

			{Array.from({length: totalPages}, (_, i) => {
					const pageNumber = i + 1;

					return (
						<button
							key={pageNumber}
							disabled={currentPage === pageNumber}
							onClick={() => handlePageChange(pageNumber)}
							className="text-zinc-500 hover:text-zinc-900 transition cursor-pointer disabled:text-zinc-900"
						>
							{pageNumber}
						</button>
					)
				}
			)}

			<PaginationButton
				text="next"
				disabled={currentPage === totalPages}
				onClick={() => handlePageChange(currentPage + 1)}
			/>
		</div>
	)
}