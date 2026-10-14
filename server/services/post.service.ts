import { Op } from "sequelize";
import db from "@/models/index.js";

interface GetPostsFilters {
	searchString?: string;
	userId?: number | undefined;
	limit: number;
	offset: number;
}

interface CreatePostInput {
	userId: number;
	title: string;
	excerpt: string;
	description: string;
}

interface UpdatePostInput {
	id: number;
	userId: number;
	title: string;
	excerpt: string;
	description: string;
}

export const postService = {
	getPosts: async ({searchString, userId, limit, offset}: GetPostsFilters) => {
		const searchQuery = searchString ? {
			[Op.or]: [
				{description: {[Op.iLike]: `%${searchString}%`}},
				{title: {[Op.iLike]: `%${searchString}%`}}
			]
		} : {};

		const {rows, count} = await db.Post.findAndCountAll({
			where: {...searchQuery, ...(userId ? {userId} : {})},
			limit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		return {
			posts: rows.map(post => post.toJSON()),
			count
		};
	},

	getPostById: async (id: number) => {
		const post = await db.Post.findByPk(id, {
			include: [{
				model: db.Comment,
				as: "Comments",
				where: {replyId: null},
				required: false,
				include: [
					{
						model: db.User,
						as: "User",
						attributes: ["id", "name", "email"]
					},
					{
						model: db.Comment,
						as: "Replies",
						include: [{
							model: db.User,
							as: "User",
							attributes: ["id", "name", "email"]
						}]
					}
				]
			}]
		});
		return post ? post.toJSON() : null;
	},

	createPost: async (data: CreatePostInput) => {
		return await db.Post.create(data);
	},

	updatePost: async ({id, userId, title, excerpt, description}: UpdatePostInput) => {
		const [affectedCount] = await db.Post.update(
			{title, excerpt, description},
			{
				where: {id, userId},
				returning: true
			}
		);
		return affectedCount > 0;
	},

	deletePost: async (id: number, userId: number) => {
		const result = await db.Post.destroy({
			where: {id, userId},
		});
		return result > 0;
	}
};
