import type { PostType } from "@/types/types";
import type { Request } from "express";

export const getValidatedPost = (req: Request): PostType => {
	const postData = req.body as PostType;

	if (!postData || Object.keys(postData).length === 0) {
		throw new Error('Invalid Body');
	}

	const title = postData.title?.toString().trim();
	const excerpt = postData.excerpt?.toString().trim();
	const description = postData.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new Error('Invalid data');
	}

	return { ...postData, title, excerpt, description } as PostType;
};