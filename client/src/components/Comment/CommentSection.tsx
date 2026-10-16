import { Comment } from "@/components/Comment/Comment";
import { CommentForm } from "@/components/Comment/CommentForm";
import { PostType, User } from "@/types/types";

interface Props {
	post: PostType;
	user: User | null;
}

export const CommentSection = (
	{
		post,
		user,
	}: Props
) => {

	return (
		<div>
			{post.Comments && post.Comments.length > 0
				? <div className="flex flex-col gap-2">
						{post.Comments.map((comment) =>
							<Comment
								key={comment.id}
								comment={comment}
								currentUser={user}
							/>
						)}
				</div>
				: <p className="text-slate-400 italic">No comments yet. Be the first!</p>
			}

			{user
				? <div className="mb-8 max-w-2xl">
						<CommentForm postId={post.id} replyId={null} />
					</div>
				: <p className="text-sm text-slate-400 mb-6 italic">Please sign in to join the conversation.</p>
			}
		</div>
	)
}