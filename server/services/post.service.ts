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

interface UpdatePostInput extends CreatePostInput {
	id: number;
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

	updatePost: async ({id, userId, ...data}: UpdatePostInput) => {
		const oldPost = await db.Post.findOne({where: {id, userId}});
		if (!oldPost) {
			return {success: false};
		}

		await db.Post.update(
			{...data},
			{
				where: {id, userId},
				returning: true
			}
		);

		return {
			success: true,
			oldImages: oldPost.images
		};
	},

	deletePost: async (id: number, userId: number) => {
		const post = await db.Post.findOne({where: {id, userId}});
		if (!post) {
			return { success: false };
		}

		await db.Post.destroy({
			where: {id, userId},
		});
		return {
			success: true,
			imagesData: post.images
		};
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
