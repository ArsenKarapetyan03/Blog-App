import { Metadata } from "next";
import { DATA_URL } from "@/config/api";
import { PostActions } from "@/components/ui/PostActions";
import type { PostType } from "@/types/types";

export async function generateMetadata({params}: {params: Promise<{id: string}>}): Promise<Metadata> {
	const {id} = await params;
	const response = await fetch(`${DATA_URL}posts/${id}`);

	if (!response.ok) {
		return {
			title: "No post found",
		};
	}

	const post: PostType = await response.json();

	return {
		title: post.title,
		description: post.excerpt || post.description.substring(0, 160),
		openGraph: {
			title: post.title,
			description: post.excerpt,
			type: "article",
			publishedTime: post.date,
			authors: [post.author],
		},
	};
}

const PostPage = async ({params}: {params: Promise<{id: string}>}) => {
	const {id} = await params;

	const response = await fetch(`${DATA_URL}posts/${id}`);
	const post: PostType = await response.json();

	return (
		<div className="flex flex-col gap-10">
			<header className="flex flex-col gap-10 border-b border-slate-100">
				<div className="flex">
					<h1 className="flex-1 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900">
						{post.title}
					</h1>
					<PostActions postData={post} />
				</div>

				<div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
					<div className="flex items-center gap-2 py-5">
						<span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
							{post.author[0]}
						</span>
						<span className="font-semibold text-slate-700">{post.author}</span>
					</div>
					<span className="text-slate-300">•</span>
					<time>{post.date}</time>
				</div>
			</header>

			<div className="text-xl text-slate-600 font-light border-l-4 border-indigo-500 pl-4 italic">
				{post.excerpt}
			</div>

			<div className="text-lg text-zinc-600">
				{post.description}
			</div>
		</div>
	)
}

export default PostPage;
