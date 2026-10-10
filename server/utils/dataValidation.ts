import type { PostType } from "@/types/types.js";

export const getValidatedPost = (body: Partial<PostType>) => {
	const title = body.title?.toString().trim();
	const excerpt = body.excerpt?.toString().trim();
	const description = body.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new Error("Invalid data");
	}

	return {title, excerpt, description};
};