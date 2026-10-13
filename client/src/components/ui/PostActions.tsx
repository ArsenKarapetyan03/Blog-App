"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Modal } from "antd";
import { deletePost } from "@/actions/post";
import { type PostType } from "@/types/types";

const PostModal = dynamic(() =>
		import("@/components/PostModal/PostModal").then((mod) => mod.PostModal),
	{ ssr: false }
);

export const PostActions = ({postData}: {postData: PostType}) => {
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const router = useRouter();
	const [isPostOpen, setIsPostOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleOpenModal = () => {
		setIsPostOpen(true);
		closeDropdown();
	};

	const closeDropdown = () => {
		if (detailsRef.current) {
			detailsRef.current.removeAttribute("open");
		}
	};

	const showDeleteConfirm = () => {
		closeDropdown();

		Modal.confirm({
			title: "Are you sure delete this post?",
			content: "This action cannot be undone.",
			okText: "Delete",
			okType: "danger",
			centered: true,
			async onOk() {
				setIsDeleting(true);
				try {
					const response = await deletePost(postData.id);
					if (response.success) {
						router.push("/");
						router.refresh();
					} else {
						alert(response?.message || "Failed to delete");
						throw new Error(response?.message);
					}
				} catch (error) {
					setIsDeleting(false);
					return Promise.reject(error);
				} finally {
					setIsDeleting(false);
				}
			},
		});
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
				detailsRef.current.removeAttribute("open");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			<details
				ref={detailsRef}
				className={`relative inline-block ${isDeleting ? "opacity-60 pointer-events-none" : ""}`}
			>
				<summary className="list-none outline-none flex items-center p-2 cursor-pointer select-none">
					<Ellipsis className="text-zinc-500 hover:bg-black/5 transition rounded" />
				</summary>

				<div
					className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-50">
					<button
						type="button"
						disabled={isDeleting}
						onClick={handleOpenModal}
						className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition
						 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Pencil className="w-4 h-4 text-zinc-500" />
						Edit
					</button>

					<button
						type="button"
						disabled={isDeleting}
						onClick={showDeleteConfirm}
						className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition
						 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Trash2 className="w-4 h-4 text-red-500" />
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</details>

			{isPostOpen && <PostModal isOpen={isPostOpen} setIsOpen={setIsPostOpen} postData={postData} />}
		</>
	);
};
