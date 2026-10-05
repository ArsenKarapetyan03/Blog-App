import type { PostType } from "@/types/types";

export const validatePostForm = (data: Partial<PostType>) => {
	const title = data?.title?.toString().trim();
	const excerpt = data?.excerpt?.toString().trim();
	const description = data?.description?.toString().trim();

	if (!title || !excerpt || !description) {
		return null;
	}

	return { title, excerpt, description };
};
