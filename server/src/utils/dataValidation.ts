import type { PostType } from "@/types/types";

export const getValidatedPost = (body: Partial<PostType>): PostType => {
	const title = body.title?.toString().trim();
	const excerpt = body.excerpt?.toString().trim();
	const description = body.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new Error("Invalid data");
	}

	return { title, excerpt, description} as Partial<PostType>;
};