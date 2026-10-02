"use client"

import { useState } from "react";
import dynamic from "next/dynamic";

const PostModal = dynamic(() =>
		import("@/components/PostModal/PostModal").then((mod) => mod.PostModal),
	{ssr: false}
);

export const AddPostButton = () => {

	const [isOpen, setIsOpen] = useState(false);
	const handleOpen = () => setIsOpen(true);

	return (
		<>
			<button
				type="button"
				onClick={handleOpen}
				className="p-2 text-white bg-zinc-800 rounded-xl cursor-pointer transition border hover:border-indigo-800 hover:text-indigo-300"
			>
				Add new Post
			</button>

			{isOpen && <PostModal isOpen={isOpen} setIsOpen={setIsOpen} />}
		</>
	)
}