"use client";

import { type Dispatch, type SetStateAction, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { FormActions } from "@/components/PostModal/FormActions";
import { createPost, updatePost } from "@/actions/post";
import { type PostType } from "@/types/types";

const INPUT_STYLES = "w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500";

interface PostModalProps {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	postData?: PostType;
}

const initialState = { success: false, message: "" };

export const PostModal = ({ isOpen, setIsOpen, postData }: PostModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const router = useRouter();
	const isEditMode = !!postData;

	const [state, formAction, isPending] = useActionState(async (prevState: typeof initialState, formData: FormData) => {
		try {
			const action = isEditMode ? updatePost : createPost;
			const response = await action(formData);

			if (response?.success) {
				setIsOpen(false);
				router.refresh();
				return initialState;
			}
			return response || { success: false, message: "Something went wrong" };
		} catch (error) {
			return { success: false, message: "Error creating post" };
		}
	}, initialState);

	const handleClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
			formRef.current?.reset();
		}
	}, [isOpen]);

	return (
		<dialog
			ref={dialogRef}
			onClose={handleClose}
			onCancel={handleClose}
			className="p-6 m-auto w-full sm:max-w-2/3 md:w-1/2 text-white border border-zinc-800 rounded-xl shadow-2xl
			 bg-zinc-900 backdrop:bg-black/50 transition-[opacity,transform,overlay,display] duration-300 allow-discrete
			 opacity-0 open:opacity-100 starting:open:opacity-0"
		>
			<div className="w-full">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">
						{isEditMode ? "Edit Post" : "Create New Post"}
					</h3>
					<button
						type="button"
						onClick={handleClose}
						className="text-zinc-400 hover:text-white text-sm cursor-pointer"
					>
						<X />
					</button>
				</div>

				<form
					key={postData?.id || "new-post"}
					name="post-modal"
					ref={formRef}
					action={formAction}
					className="flex flex-col gap-4"
				>
					{isEditMode && <input type="hidden" name="id" value={postData?.id} />}

					<div>
						<label htmlFor="title" className="block text-zinc-400 mb-1">Title</label>
						<input
							id="title"
							name="title"
							type="text"
							required
							className={INPUT_STYLES}
							defaultValue={postData?.title}
						/>
					</div>

					<div>
						<label htmlFor="excerpt" className="block text-zinc-400 mb-1">Excerpt</label>
						<input
							id="excerpt"
							name="excerpt"
							type="text"
							required
							className={INPUT_STYLES}
							defaultValue={postData?.excerpt}
						/>
					</div>

					<div>
						<label htmlFor="description" className="block text-zinc-400 mb-1">Content</label>
						<textarea
							id="description"
							name="description"
							rows={4}
							required
							className="w-full p-2 text-white bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-indigo-500"
							defaultValue={postData?.description}
						/>
					</div>

					<div>
						<label htmlFor="photos" className="block text-zinc-400 mb-1">
							Photos (up to 5, 5 MB each)
						</label>
						<input
							id="photos"
							name="photos"
							type="file"
							accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
							multiple
							className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-white file:cursor-pointer"
						/>
					</div>

					{state?.message && !state.success && (
						<div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800 text-red-200 rounded-lg text-sm animate-in fade-in zoom-in-95 duration-200">
							<AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
							<span>{state.message}</span>
						</div>
					)}

					<FormActions onCancel={handleClose} isPending={isPending} />
				</form>
			</div>
		</dialog>
	);
};
