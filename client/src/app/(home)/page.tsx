import { EmptyState } from "@/components/ui/EmptyState";
import { BriefPost } from "@/components/BriefPost";
import { Pagination } from "@/components/Pagination/Pagination";
import type { PostType } from "@/types/types";
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
	const currentPage = Number(resolvedParams?.page) || 1;

	const response = await fetch(`${DATA_URL}posts`);
	const posts: PostType[] = await response.json();

	const filteredByQuery = query
		? posts.filter((post: PostType) => post.title.toLowerCase().includes(query.toLowerCase()))
		: [...posts];

	const totalPages = Math.ceil(filteredByQuery.length / POSTS_PER_PAGE);
	const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
	const endIndex = startIndex + POSTS_PER_PAGE;

	const filteredByPages = filteredByQuery.slice(startIndex, endIndex);

	if (!filteredByPages.length) {
		return (
			<EmptyState
				message="No posts found"
				className="m-1 md:m-5 text-zinc-500"
			/>
		)
	}

	return (
		<div className="flex flex-col gap-12">
			{filteredByPages.map(post => <BriefPost post={post} key={post.id} />)}

			{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
		</div>
	)
}

export default Page;