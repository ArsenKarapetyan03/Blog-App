import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { MessageCircle } from "lucide-react";
import { BASE_URL } from "@/config/api";
import { PostActions } from "@/components/ui/PostActions";
import { Comment } from "@/components/Comment/Comment";
import { CommentForm } from "@/components/Comment/CommentForm";
import { InfoRow } from "@/components/ui/InfoRow";
import { LikeButton } from "@/components/ui/LikeButton";
import { PostGallery } from "@/components/ui/PostGallery";
import { getSessionUser } from "@/actions/auth";
import { type PostType } from "@/types/types";
import { CommentSection } from "@/components/Comment/CommentSection";

async function getPost(id: string): Promise<PostType | null> {
	try {
		const token = (await cookies()).get("token")?.value;

		const response = await fetch(`${BASE_URL}/blog/${id}`,
			{
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				cache: "no-store"
			}
		);

		if (!response.ok) {
			return null;
		}

		return await response.json();
	} catch (error) {
		return null;
	}
}

export const generateMetadata = async({params}: {params: Promise<{id: string}>}): Promise<Metadata> => {
	const {id} = await params;
	const post = await getPost(id);

	if (!post) {
		return {title: "No post found"};
	}

	return {title: post.title, description: post.description.substring(0, 160)};
}

const PostPage = async ({params}: {params: Promise<{id: string}>}) => {
	const {id} = await params;
	const [post, user] = await Promise.all([getPost(id), getSessionUser()]);

	if (!post) {
		notFound();
	}

	const isAuthor = user && String(user.id) === String(post.userId);

	const totalCommentsCount = (post.Comments || []).reduce(
		(acc, comment) => acc + 1 + (comment.Replies?.length || 0), 0
	);

	return (
		<div className="flex flex-col gap-10">
			<header className="flex flex-col gap-6 border-b border-slate-200 pb-6">
				<div className="flex items-start">
					<h1 className="flex-1 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900">
						{post.title}
					</h1>
					{isAuthor && <PostActions postData={post} />}
				</div>
				<InfoRow name={post.User.name} createdAt={post.createdAt} />
			</header>

			{post.excerpt && (
				<div className="text-xl text-slate-600 font-light border-l-4 border-indigo-500 pl-4 italic">
					{post.excerpt}
				</div>
			)}

			{post.images?.length > 0 && (
				<PostGallery
					images={post.images}
					baseUrl={BASE_URL}
					postTitle={post.title}
				/>
			)}

			<div className="text-lg text-zinc-600 leading-relaxed whitespace-pre-wrap">{post.description}</div>

			<div className="p-2 flex gap-10 border-b border-slate-100 pb-4">
					<LikeButton
						postId={post.id}
						initialLikesCount={post.likesCount || 0}
						initialIsLiked={post.isLikedByMe || false}
						hasUser={!!user}
					/>

				{totalCommentsCount > 0
					&& <div className="flex items-center gap-2 text-slate-500">
                <MessageCircle size={20} />
                <span>{totalCommentsCount}</span>
            </div>
				}
			</div>

			<div className="px-2">
				<div className="flex gap-2 pb-5 items-center">
					<MessageCircle className="text-slate-800" />
					<span className="font-bold text-xl text-slate-800">Discussion</span>
				</div>

				<CommentSection post={post} user={user} />
			</div>
		</div>
	);
};

export default PostPage;
