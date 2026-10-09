import type { PostType } from "@/types/types.js";

export const getValidatedPost = (body: Partial<PostType>): PostType => {
	const title: string = body.title?.toString().trim();
	const excerpt: string = body.excerpt?.toString().trim();
	const description: string = body.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new Error("Invalid data");
	}

	return { title, excerpt, description} as Partial<PostType>;
};