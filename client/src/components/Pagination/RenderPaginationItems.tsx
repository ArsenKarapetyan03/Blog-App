import React from "react";

import { PaginationButton } from "@/components/Pagination/PaginationButton";

interface RenderPaginationItemsProps {
	totalPages: number;
	currentPage: number;
	onPageChange: (page: number) => void;
}

export const RenderPaginationItems: React.FC<RenderPaginationItemsProps> = (
	{
		totalPages,
		currentPage,
		onPageChange,
	}) => {
	const renderPageButton = (page: number) => (
		<button
			key={page}
			disabled={currentPage === page}
			onClick={() => onPageChange(page)}
			className="text-zinc-500 hover:text-zinc-900 transition cursor-pointer disabled:text-zinc-900 disabled:font-bold disabled:cursor-default"
		>
			{page}
		</button>
	);

	if (totalPages <= 4) {
		return (<>
			{Array.from({length: totalPages}, (_, i) => i + 1).map((page) =>
				renderPageButton(page)
			)}
		</>);
	}

	const items: React.ReactNode[] = [];

	items.push(renderPageButton(1));

	if (currentPage > 3) {
		items.push(<span key="dots-start" className="text-zinc-400 select-none">...</span>);
	}

	const startPage = Math.max(2, currentPage - 1);
	const endPage = Math.min(totalPages - 1, currentPage + 1);

	let adjustedStart = startPage;
	let adjustedEnd = endPage;

	if (currentPage <= 2) {
		adjustedEnd = 3;
	} else if (currentPage >= totalPages - 1) {
		adjustedStart = totalPages - 2;
	}

	for (let page = adjustedStart; page <= adjustedEnd; page++) {
		items.push(renderPageButton(page));
	}

	if (currentPage < totalPages - 2) {
		items.push(<span key="dots-end" className="text-zinc-400 select-none">...</span>);
	}

	items.push(renderPageButton(totalPages));

	return <>{items}</>;
};
