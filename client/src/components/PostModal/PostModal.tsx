"use client";

import { type Dispatch, type SetStateAction, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Plus, Trash } from "lucide-react";
import { FormActions } from "@/components/PostModal/FormActions";
import { createPost, updatePost } from "@/actions/post";
import { type PostType } from "@/types/types";
import { Upload, type UploadFile } from "antd";
import { BASE_URL } from "@/config/api";

const INPUT_STYLES = "w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500";

interface PostModalProps {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	postData?: PostType;
}

const initialState = {success: false, message: ""};

export const PostModal = ({isOpen, setIsOpen, postData}: PostModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const router = useRouter();
	const isEditMode = !!postData;

	const [state, formAction, isPending] = useActionState(
		async (prevState: typeof initialState, formData: FormData) => {
			formData.delete("file");

			const existingPhotos: string[] = [];

			for (const file of fileList) {
				if (file.originFileObj) {
					formData.append("photos", file.originFileObj, file.name);
				} else if (file.url) {
					existingPhotos.push(file.url);
				}
			}

			formData.append("existingPhotos", JSON.stringify(existingPhotos));

			const action = isEditMode ? updatePost : createPost;
			const response = await action(formData);

			if (response?.success) {
				setIsOpen(false);
				setFileList([]);
				router.refresh();
				return initialState;
			}

			return response || {
				success: false,
				message: "Something went wrong",
			};
		},
		initialState
	);

	const handleClose = () => {
		setIsOpen(false);
	};

	const handleUploadChange = ({fileList: newFileList}: { fileList: UploadFile[] }) => {
		const updatedList = newFileList.map(file => {
			if (!file.status) {
				file.status = "done";
			}
			return file;
		});
		setFileList(updatedList);
	};

	useEffect(() => {
		if (isOpen && postData?.Images) {
			const existingPhotos: UploadFile[] = postData.Images.map((image, index) => ({
				uid: `existing-${index}`,
				name: image.imagePath.split("/").pop() || `image-${index}`,
				status: "done",
				url: new URL(image.imagePath, BASE_URL).toString(),
			}));
			setFileList(existingPhotos);
		} else if (!isOpen) {
			setFileList([]);
		}
	}, [isOpen, postData]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
			formRef.current?.reset();
			setFileList([]);
		}
	}, [isOpen]);

	return (
		<dialog
			ref={dialogRef}
			onClose={handleClose}
			onCancel={handleClose}
			className="p-6 m-auto w-full sm:max-w-2/3 md:w-1/2 text-white border border-zinc-800 rounded-xl
			 shadow-2xl bg-zinc-900 backdrop:bg-black/50 transition-[opacity,transform,overlay,display]
			 duration-300 allow-discrete opacity-0 open:opacity-100 starting:open:opacity-0"
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
					{isEditMode && <input type="hidden" name="id" value={postData?.id}/>}

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
						<Upload
							id="photos"
							accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
							listType="picture-card"
							fileList={fileList}
							onChange={handleUploadChange}
							beforeUpload={(file) => {
								const isAllowedSize = file.size <= 5 * 1024 * 1024;
								if (!isAllowedSize) {
									console.error(`${file.name} exceeds the 5 MB limit`);
								}
								return false;
							}}
							maxCount={5}
							multiple
							className="block
							[&_.ant-upload-select]:!bg-zinc-800
							[&_.ant-upload-select]:!border-zinc-700
							[&_.ant-upload-select]:hover:!border-indigo-500
							[&_.ant-upload-select_text]:text-zinc-400"

							itemRender={(originNode, file, currFileList, actions) => {
								const src = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");

								return (
									<div
										className="relative w-25 h-25 border border-zinc-700 bg-zinc-800 rounded-lg overflow-hidden group">

										{src ? (
											<img
												src={src}
												alt={file.name}
												className="w-full h-full object-cover block"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
												Loading...
											</div>
										)}

										<div
											className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-200">
											<button
												type="button"
												onClick={actions.remove}
												className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
												title="Remove file"
											>
												<Trash />
											</button>
										</div>
									</div>
								);
							}}
						>
							{fileList.length >= 5 ? null : (
								<div
									className="flex flex-col items-center justify-center text-zinc-400 hover:text-indigo-400 transition-colors">
									<Plus className="w-5 h-5 mb-1"/>
									<div className="text-xs">Upload</div>
								</div>
							)}
						</Upload>
					</div>

					{state?.message && !state.success && (
						<div
							className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800 text-red-200 rounded-lg text-sm animate-in fade-in zoom-in-95 duration-200">
							<AlertCircle className="w-4 h-4 shrink-0 text-red-400"/>
							<span>{state.message}</span>
						</div>
					)}

					<FormActions onCancel={handleClose} pending={isPending} />
				</form>
			</div>
		</dialog>
	);
};
