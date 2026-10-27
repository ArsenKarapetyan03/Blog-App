import type { PostType } from "@/types/types";

export const BriefPost = ({post}: {post: PostType}) => (
	<div
		className="flex flex-col md:flex-row md:items-start md:gap-8 px-5 py-10 group rounded-xl border border-zinc-100
	   dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-200
	   hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
	>
		<div className="flex items-center gap-3 md:flex-col md:items-start md:w-32 mb-3">
			<time className="text-xs font-medium text-slate-400">
				{new Date(post.createdAt).toISOString().split('T')[0]}
			</time>
			<span className="inline-block h-px w-6 bg-slate-200"></span>
			<span
				className="text-base font-semibold text-slate-700 bg-slate-100
				 px-2 py-1 rounded md:bg-transparent md:p-0"
			>
				{post.User.name}
			</span>
		</div>

		<div className="flex-1">
			<h2 className="text-2xl font-semibold text-slate-900">
				{post.title}
			</h2>

			<p className="mt-3 text-lg text-slate-600">
				{post.excerpt}
			</p>

			<a
				href={`/posts/${post.id}`}
				className="mt-4 inline-flex items-center text-base font-medium
				 text-indigo-600 hover:text-indigo-800"
			>
				Read more
			</a>
		</div>
	</div>
)