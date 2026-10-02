import type { PostType } from "@/types/types";

export const BriefPost = ({post}: {post: PostType}) => (
	<div className="flex flex-col md:flex-row md:items-start md:gap-8 px-5 py-10 rounded border-b border-slate-100 hover:bg-zinc-50 transition-colors duration-200">
		<div className="flex items-center gap-3 md:flex-col md:items-start md:w-32 mb-3">
			<time className="text-xs font-medium text-slate-400">
				{post.date}
			</time>
			<span className="inline-block h-px w-6 bg-slate-200"></span>
			<span className="text-base font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded md:bg-transparent md:p-0">
				{post.author}
			</span>
		</div>

		<div className="flex-1">
			<h2 className="text-2xl font-semibold text-slate-900">
				<a href={`/posts/${post.id}`} className="hover:text-indigo-500 hover:underline">
					{post.title}
				</a>
			</h2>

			<p className="mt-3 text-lg text-slate-600">
				{post.excerpt}
			</p>

			<div className="mt-4">
				<a
					href={`/posts/${post.id}`}
					className="inline-flex items-center text-base font-medium text-indigo-600 hover:text-indigo-800"
				>
					Read more
				</a>
			</div>
		</div>
	</div>
)