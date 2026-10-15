"use client";

import { useState } from "react";
import { InfoRow } from "@/components/ui/InfoRow";
import { CommentForm } from "./CommentForm";
import type { CommentType, User } from "@/types/types";

interface CommentProps {
	comment: CommentType;
	postId: number;
	currentUser: User | null;
}

export const Comment = ({ comment, postId, currentUser }: CommentProps) => {
	const [isReplying, setIsReplying] = useState(false);

	return (
		<div className="text-lg mb-6 border-b border-slate-100 pb-4 last:border-b-0">
			<InfoRow name={comment.User.name} createdAt={comment.createdAt}/>

			<div className="px-5 text-slate-600 mt-1">
				<div>{comment.content}</div>

				{currentUser && (
					<button
						onClick={() => setIsReplying(!isReplying)}
						className="text-xs text-indigo-600 font-semibold hover:underline mt-1 block cursor-pointer"
					>
						Reply
					</button>
				)}

				{isReplying && (
					<div className="max-w-md my-2">
						<CommentForm
							postId={postId}
							replyId={comment.id}
							onCancel={() => setIsReplying(false)}
						/>
					</div>
				)}

				{comment.Replies && comment.Replies.length > 0 && (
					<div className="flex flex-col mt-4 border-l-2 border-indigo-100 pl-4 bg-slate-50/50 p-2 rounded-r-md gap-4">
						{comment.Replies.map((reply: CommentType) => (
							<div key={reply.id} className="pt-1 pb-1">
								<span className="text-xs text-slate-400 block mb-1">
									Replied to {comment.User.name}'s comment
								</span>
								<InfoRow name={reply.User.name} createdAt={reply.createdAt}/>
								<div className="px-5 text-slate-700 text-base mt-1">{reply.content}</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
