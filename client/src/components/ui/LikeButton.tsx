"use client";

import { useOptimistic, startTransition, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleLikeAction } from "@/actions/post";
import { SignInModal } from "@/components/ui/SignInModal";

interface LikeButtonProps {
	postId: number;
	initialLikesCount: number;
	initialIsLiked: boolean;
	hasUser: boolean;
}

export const LikeButton = (
	{
		postId,
		initialLikesCount,
		initialIsLiked,
		hasUser
	}: LikeButtonProps
) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [optimisticLike, setOptimisticLike] = useOptimistic(
		{
			likesCount: initialLikesCount,
			isLiked: initialIsLiked
		},
		(state) => ({
			likesCount: state.isLiked ? state.likesCount - 1 : state.likesCount + 1,
			isLiked: !state.isLiked
		})
	);

	const handleLikeClick = () => {
		if (!hasUser) {
			setIsModalOpen(true);
			return;
		}

		startTransition(async () => {
			setOptimisticLike({});
			await toggleLikeAction(postId);
		});
	};

	return (
		<>
			<button
				onClick={handleLikeClick}
				className={`flex gap-2 items-center cursor-pointer transition active:scale-90 p-2 rounded-md 
					${
						optimisticLike.isLiked
							? "text-indigo-600 bg-indigo-50 font-semibold"
							: "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
				}`}
			>
				<ThumbsUp size={20} fill={optimisticLike.isLiked ? "currentColor" : "none"} />
				<span>{optimisticLike.likesCount ? optimisticLike.likesCount : ""}</span>
			</button>

			<SignInModal
				isOpen={isModalOpen}
				onClose={()=>setIsModalOpen(false)}
			/>
		</>
	);
};
