"use client"

import { Segmented } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PostFilterProps {
	authorized: boolean;
	currentFilter: "All" | "My";
}

export const PostFilter = ({authorized, currentFilter}: PostFilterProps) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const handleFilterChange = (value: string) => {
		if (value === "My" && !authorized) {
			return;
		}

		const params = new URLSearchParams(searchParams.toString());
		params.set("page", "1");

		if (value === "My") {
			params.set("filter", "my");
		} else {
			params.delete("filter");
		}

		router.replace(`${pathname}?${params.toString()}`, {scroll: false});
	};

	return (
		<Segmented
			options={[
				{label: "All", value: "All"},
				{label: "My", value: "My", disabled: !authorized},
			]}
			value={currentFilter}
			onChange={handleFilterChange}
		/>
	);
};