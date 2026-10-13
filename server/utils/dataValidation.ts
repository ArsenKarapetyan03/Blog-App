import { AppError } from "@/utils/appError.js";

interface RawPost {
	title: string,
	excerpt: string,
	description: string
}

export const getValidatedPost = (post: RawPost) => {
	if (!post) {
		throw new AppError("All fields (title, excerpt, description) are required.", 400);
	}

	const title = post.title?.toString().trim();
	const excerpt = post.excerpt?.toString().trim();
	const description = post.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new AppError("All fields (title, excerpt, description) are required.", 400);
	}

	return {title, excerpt, description};
};