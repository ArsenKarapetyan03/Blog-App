interface PaginationButtonProps {
	text: string;
	disabled: boolean;
	onClick: () => void;
}

export const PaginationButton = (
	{
		text,
		disabled,
		onClick,
	}: PaginationButtonProps
) => (
	<button
		type="button"
		disabled={disabled}
		onClick={onClick}
		className="px-3 rounded-xl text-zinc-500 hover:text-zinc-800 transition cursor-pointer disabled:hidden"
	>
		{text}
	</button>
);