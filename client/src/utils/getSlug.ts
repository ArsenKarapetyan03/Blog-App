// import slugify from "slugify";
//
// export const getSlug = (title: string) =>
// 	slugify(title, {
// 			lower: true,
// 			strict: true,
// 		}
// 	)



// export async function generateStaticParams() {
// 	const response = await fetch(DATA_URL);
// 	const posts: PostType[] = await response.json();
//
// 	return posts.map((post) => ({id: String(post.id)}));
// }