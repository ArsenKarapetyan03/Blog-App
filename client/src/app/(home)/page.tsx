import { cookies } from "next/headers";
import { EmptyState } from "@/components/ui/EmptyState";
import { BriefPost } from "@/components/BriefPost";
import Pagination from "@/components/Pagination";
import { AddPostButton } from "@/components/PostModal/AddPostButton";
import { PostFilter } from "@/components/PostFilter";
import { Search } from "@/components/Search";
import { type PostType } from "@/types/types";
import { BASE_URL } from "@/config/api";

interface PageProps {
	searchParams: Promise<{
		page?: string;
		query?: string;
		filter?: string;
	}>
}

const POSTS_PER_PAGE = 4;

const Page = async ({searchParams}: PageProps) => {
	const resolvedParams = await searchParams;

	const token = (await cookies()).get("token");
	const isAuthorized = !!token;

	const query = resolvedParams?.query || "";
	const currentFilter = resolvedParams?.filter === "my" && isAuthorized ? "My" : "All";
	const requestedPage = Number(resolvedParams?.page);

	const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

	const params = new URLSearchParams({
		page: String(currentPage),
		limit: String(POSTS_PER_PAGE),
	});

	if (query) {
		params.set("query", query);
	}

	const endpoint = currentFilter === "My" ? "/blog/mine" : "/blog";
	const response = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`, {
		cache: "no-store",
		headers: {
			"Authorization": `Bearer ${token?.value}`,
			"Content-Type": "application/json"
		}
	});

	let posts: PostType[] = [];
	let totalPages = 0;

	if (!response.ok) {
		console.error(`Failed to load posts: ${response.status} ${response.statusText}`);
	} else {
		const data: {posts: PostType[]; totalPages: number} = await response.json();
		posts = data.posts;
		totalPages = data.totalPages;
	}

	return (
		<div>
			<div className="py-10 flex justify-between border-b border-slate-200">
				<AddPostButton authorized={isAuthorized} />
				<Search />
			</div>

			{isAuthorized
				&& <div className="p-4 flex justify-end">
              <PostFilter authorized={isAuthorized} currentFilter={currentFilter}/>
          </div>
			}

			{!posts.length
				? <EmptyState message="No posts found" className="m-1 md:m-5 text-zinc-500" />
				: <div className="flex flex-col gap-4">
						{posts.map(post => <BriefPost post={post} key={post.id} />)}
						{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
					</div>
			}
		</div>
	);
}

export default Page;