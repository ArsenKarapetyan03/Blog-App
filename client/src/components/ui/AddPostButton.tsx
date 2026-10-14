"use client"

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {SignInModal} from "@/components/ui/SignInModal";

const PostModal = dynamic(() =>
		import("@/components/PostModal/PostModal").then((mod) => mod.PostModal),
	{ssr: false}
);

export const AddPostButton = ({authorized}: {authorized: boolean}) => {

	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

	return (
		<>
			<button
				type="button"
				onClick={handleOpen}
				className="p-2 text-white bg-zinc-800 rounded-xl cursor-pointer transition border hover:border-indigo-800 hover:text-indigo-300"
			>
				Add new Post
			</button>

			{isOpen && authorized
				? <PostModal
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>
				: <SignInModal
						isOpen={isOpen}
						onClose={handleClose}
						onContinue={()=>router.push("/sign-in")}
				/>
			}
		</>
	)
}