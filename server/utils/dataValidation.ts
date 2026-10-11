interface RawPost {
	title: string,
	excerpt: string,
	description: string
}

export const getValidatedPost = (post: RawPost) => {
	const title = post.title?.toString().trim();
	const excerpt = post.excerpt?.toString().trim();
	const description = post.description?.toString().trim();

	if (!title || !excerpt || !description) {
		throw new Error("Invalid data");
	}

	return {title, excerpt, description};
};