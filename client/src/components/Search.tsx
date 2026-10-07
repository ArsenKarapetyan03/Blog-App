"use client"

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDebouncedCallback } from 'use-debounce';
import { X } from "lucide-react";
import { LoadingComponent } from "@/components/ui/LoadingComponent";

const SearchInput = () => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const {replace} = useRouter();

	const [inputValue, setInputValue] = useState(searchParams.get("query") || "");

	const updateUrl = useDebouncedCallback((value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		const trimmed = value.trim();
		params.set("page", "1");

		if (trimmed) {
			params.set("query", trimmed);
		} else {
			params.delete("query");
		}

		replace(`${pathname}?${params.toString()}`, {scroll: false});
	}, 300);

	const handleChange = (text: string) => {
		setInputValue(text);
		updateUrl(text);
	}

	const handleClear = () => {
		updateUrl.cancel();
		setInputValue("");

		const params = new URLSearchParams(searchParams.toString());
		params.delete("query");
		params.set("page", "1");
		replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	useEffect(() => {
		const currentQuery = searchParams.get("query") || "";
		setInputValue(currentQuery);
	}, [searchParams]);

	return (
		<form
			onSubmit={(e)=> e.preventDefault()}
			className="p-2 flex justify-center border border-zinc-400 rounded-2xl transition duration-500 focus-within:border-indigo-500"
		>
			<input
				name="search"
				type="text"
				placeholder="Search..."
				value={inputValue}
				onChange={e=>handleChange(e.target.value)}
				className="focus:outline-none hover:placeholder:text-indigo-600 placeholder:transition-colors duration-300"
			/>
			<button
				type="button"
				disabled={!inputValue}
				onClick={handleClear}
				className="text-indigo-400 cursor-pointer transition duration-300 hover:text-black disabled:text-transparent disabled:cursor-default"
			>
				<X />
			</button>
		</form>
	)
}

export const Search = dynamic(() => Promise.resolve(() => (
	<Suspense fallback={<LoadingComponent />}>
		<SearchInput />
	</Suspense>
)), {ssr: false});