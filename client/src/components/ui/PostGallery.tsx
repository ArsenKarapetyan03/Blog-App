"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

interface PostGalleryProps {
	images: {
		imagePath: string;
	}[];
	baseUrl: string;
	postTitle: string;
}

export const PostGallery = ({images, baseUrl, postTitle}: PostGalleryProps) => {
	const [activeImage, setActiveImage] = useState<string | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const openViewer = (imageUrl: string) => {
		setActiveImage(imageUrl);
	};

	const closeViewer = () => {
		dialogRef.current?.close();
	};

	useEffect(() => {
		if (activeImage) {
			dialogRef.current?.showModal();
			document.body.style.overflow = "hidden";
		} else {
			dialogRef.current?.close();
			document.body.style.overflow = "unset";
		}
	}, [activeImage]);

	const handleDialogClose = () => {
		setActiveImage(null);
	};

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2">
				{images.map((image, index) => {
					const fullUrl = new URL(image.imagePath, baseUrl).toString();
					return (
						<div
							key={image.imagePath}
							className="group relative overflow-hidden rounded-xl bg-slate-100 cursor-zoom-in"
							onClick={() => openViewer(fullUrl)}
						>
							<img
								src={fullUrl}
								alt={`${postTitle} - photo ${index + 1}`}
								className="w-full max-h-128 rounded-xl object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-90"
							/>
						</div>
					);
				})}
			</div>

			<dialog
				ref={dialogRef}
				onClose={handleDialogClose}
				onClick={(e) => e.target === dialogRef.current && closeViewer()}
				className="m-auto p-0 bg-transparent text-white max-w-[90vw] max-h-[90vh] rounded-2xl outline-none overflow-hidden
				backdrop:bg-black/80 backdrop:backdrop-blur-md
				transition-[opacity,transform,display,overlay] duration-300 allow-discrete
				opacity-0 scale-95 open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95"
			>
				{activeImage && (
					<div className="relative flex items-center justify-center">
						<button
							type="button"
							onClick={closeViewer}
							className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition backdrop-blur-sm cursor-pointer"
						>
							<X size={24} />
						</button>

						<img
							src={activeImage}
							alt="Full size view"
							className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl select-none"
						/>
					</div>
				)}
			</dialog>
		</>
	);
};
