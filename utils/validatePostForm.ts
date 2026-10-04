export const validatePostForm = (formData: FormData)=>  {
	const title = formData.get("title")?.toString().trim();
	const excerpt = formData.get("excerpt")?.toString().trim();
	const description = formData.get("description")?.toString().trim();

	if (!title || !excerpt || !description) {
		return null;
	}

	return {title, excerpt, description};
}