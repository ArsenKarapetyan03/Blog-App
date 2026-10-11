import { cookies } from "next/headers";
import { EmptyState } from "@/components/ui/EmptyState";
import { BriefPost } from "@/components/BriefPost";
import { Pagination } from "@/components/Pagination/Pagination";
import { Search } from "@/components/Search";
import { AddPostButton } from "@/components/ui/AddPostButton";
import { type PostType } from "@/types/types";
import { BASE_URL } from "@/config/api";

interface PageProps {
	searchParams: Promise<{
		page?: string;
		query?: string
	}>
}

const POSTS_PER_PAGE = 4;

const Page = async ({searchParams}: PageProps) => {
	const resolvedParams = await searchParams;

	const token = (await cookies()).get("token");
	const isAuthorized = !!token;

	const query = resolvedParams?.query || "";
	const requestedPage = Number(resolvedParams?.page);

	const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

	const params = new URLSearchParams({
		page: String(currentPage),
		limit: String(POSTS_PER_PAGE),
	});
	if (query) {
		params.set("query", query);
	}

	const response = await fetch(
		`${BASE_URL}/blog?${params.toString()}`,
		{cache: "no-store"}
	);

	if (!response.ok) {
		console.error(`Failed to load posts: ${response.status} ${response.statusText}`);
		return (<EmptyState
			message="No posts found"
			className="m-1 md:m-5 text-zinc-500"
		/>);
	}

	const {posts, totalPages}: {posts: PostType[]; totalPages: number} = await response.json();

	if (!posts.length) {
		return (
			<EmptyState
				message="No posts found"
				className="m-1 md:m-5 text-zinc-500"
			/>
		)
	}

	return (
		<div>
			<div className="py-10 flex justify-between border-b border-slate-200">
				<AddPostButton authorized={isAuthorized} />
				<Search />
			</div>

			<div className="flex flex-col gap-12">
				{posts.map(post => <BriefPost post={post} key={post.id}/>)}

				{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages}/>}
			</div>
		</div>
	);
}

export default Page;