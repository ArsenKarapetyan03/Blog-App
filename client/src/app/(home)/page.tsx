import { EmptyState } from "@/components/ui/EmptyState";
import { BriefPost } from "@/components/BriefPost";
import { Pagination } from "@/components/Pagination/Pagination";
import { type PostType } from "@/types/types";
import { DATA_URL } from "@/config/api";

interface PageProps {
	searchParams: Promise<{
		page?: string;
		query?: string
	}>
}

const POSTS_PER_PAGE = 4;

const Page = async ({searchParams}: PageProps) => {
	const resolvedParams = await searchParams;
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

	const response = await fetch(`${DATA_URL}/post?${params.toString()}`, {cache: "no-store"});
	if (!response.ok) {
		throw new Error(`Failed to load posts: ${response.status} ${response.statusText}`);
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
		<div className="flex flex-col gap-12">
			{posts.map(post => <BriefPost post={post} key={post.id} />)}

			{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
		</div>
	)
}

export default Page;