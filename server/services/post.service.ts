import { Op } from "sequelize";
import db from "#models/index.js";
import { commentService } from "@/services/comment.service.js";

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
	images: string[];
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

	getPostById: async (id: number, currentUserId?: number) => {
		const response = await db.Post.findByPk(id, {
			include: [
				{
					model: db.User,
					as: "User",
					attributes: ["id", "name", "email"]
				},
				{
					model: db.User,
					as: "LikedByUsers",
					attributes: ["id"]
				}]
		});

		if (!response) {
			return null;
		}

		const likedByUsers = response.LikedByUsers || [];
		const post = response.toJSON();

		return {
			...post,
			Comments: await commentService.getCommentsTree(id),
			likesCount: likedByUsers.length,
			isLikedByMe: currentUserId ? likedByUsers.some((u: any) => u.id === currentUserId) : false,
		};
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
	},

	toggleLike: async (postId: number, userId: number) => {
		const existingLike = await db.PostLikes.findOne({
			where: {postId, userId}
		});

		if (existingLike) {
			await db.PostLikes.destroy({
				where: {postId, userId}
			});

			return {liked: false};
		} else {
			await db.PostLikes.create({postId, userId});
			return {liked: true};
		}
	},
};
