"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationButton } from "@/components/Pagination/PaginationButton";
import { RenderPaginationItems } from "./RenderPaginationItems"

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
		<div className="flex items-center justify-center gap-5">
			<PaginationButton
				text="previous"
				disabled={currentPage === 1}
				onClick={() => handlePageChange(currentPage - 1)}
			/>

			<div className="flex items-center gap-3">
				<RenderPaginationItems
					totalPages={totalPages}
					currentPage={currentPage}
					onPageChange={handlePageChange}
				/>
			</div>

			<PaginationButton
				text="next"
				disabled={currentPage === totalPages}
				onClick={() => handlePageChange(currentPage + 1)}
			/>
		</div>
	);
};