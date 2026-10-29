export const getPaginationDirectives = (query: any) => {
	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.min(50, Math.max(1, Number(query.limit) || 4));
	return {limit, offset: (page - 1) * limit};
};