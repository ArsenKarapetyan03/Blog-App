"use client";

import { useState } from "react";
import { InfoRow } from "@/components/ui/InfoRow";
import { CommentForm } from "./CommentForm";
import type { CommentType, UserType } from "@/types/types";

interface CommentProps {
	comment: CommentType;
	currentUser: UserType | null;
}

export const Comment = ({comment, currentUser}: CommentProps) => {
	const [isReplying, setIsReplying] = useState(false);

	return (
		<div className="text-lg border-b border-slate-100 last:border-b-0">
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

				{isReplying &&
					<div className="max-w-md my-2">
						<CommentForm
							postId={comment.postId}
							replyId={comment.id}
							onCancel={() => setIsReplying(false)}
						/>
					</div>
				}

				{comment.Replies && comment.Replies.length > 0 && (
					<div className="flex flex-col mt-4 border-l-2 border-indigo-100 pl-4 bg-slate-50/50 p-2 rounded-r-md gap-4">
						{comment.Replies.map((reply: CommentType) => (
							<div key={reply.id} className="pt-1 pb-1">
								<span className="text-xs text-slate-400 block mb-1">
									Replied to {comment.User.name}'s comment
								</span>
								<Comment comment={reply} currentUser={currentUser} />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
