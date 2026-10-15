"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCommentAction, type ActionState } from "@/actions/comment";

interface CommentFormProps {
	postId: number;
	replyId: number | null;
	onCancel?: () => void;
}

const initialState: ActionState = { success: false, error: null };

export const CommentForm = ({postId, replyId, onCancel}: CommentFormProps) => {
	const [state, formAction, isPending] = useActionState(createCommentAction, initialState);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state.success && formRef.current) {
			formRef.current.reset();
			if (onCancel) onCancel();
		}
	}, [state.success, onCancel]);

	return (
		<form ref={formRef} action={formAction} className="mt-3 flex flex-col gap-2 w-full">
			<input type="hidden" name="postId" value={postId} />
			{replyId && <input type="hidden" name="replyId" value={replyId} />}

			<textarea
				name="content"
				placeholder={replyId ? "Write a reply..." : "Write a comment..."}
				rows={replyId ? 2 : 3}
				disabled={isPending}
				required
				className="w-full p-2 border border-slate-300 rounded-md text-base text-slate-800
				focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
			/>

			{state.error
				&& <p className="text-xs text-red-500 font-medium">{state.error}</p>
			}

			<div className="flex gap-2 justify-end">
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isPending}
						className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded hover:bg-slate-200 cursor-pointer disabled:opacity-50"
					>
						Cancel
					</button>
				)}
				<button
					type="submit"
					disabled={isPending}
					className="px-4 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
				>
					{isPending ? "Sending..." : replyId ? "Reply" : "Comment"}
				</button>
			</div>
		</form>
	);
};
