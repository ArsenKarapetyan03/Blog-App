import { Op } from "sequelize";
import db from "#models/index.js";
import { commentService } from "@/services/comment.service.js";
import { imageService } from "@/services/image.services.js";
export const postService = {
    getPosts: async ({ searchString, userId, limit, offset }) => {
        const searchQuery = searchString ? {
            [Op.or]: [
                { description: { [Op.iLike]: `%${searchString}%` } },
                { title: { [Op.iLike]: `%${searchString}%` } }
            ]
        } : {};
        const { rows, count } = await db.Post.findAndCountAll({
            where: { ...searchQuery, ...(userId ? { userId } : {}) },
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        return {
            posts: rows.map(post => post.toJSON()),
            count
        };
    },
    getPostById: async (id, currentUserId) => {
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
                },
                "Images"
            ]
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
            isLikedByMe: currentUserId ? likedByUsers.some((u) => u.id === currentUserId) : false,
        };
    },
    createPost: async (data) => {
        return await db.Post.create(data, {
            include: ["Images"]
        });
    },
    updatePost: async (data) => {
        return db.sequelize.transaction(async (transaction) => {
            const post = await db.Post.findOne({
                where: { id: data.id, userId: data.userId },
                include: ["Images"],
                transaction
            });
            if (!post) {
                return { success: false, removedImagePaths: [] };
            }
            const currentImagePaths = (post.Images || []).map(image => image.imagePath);
            const retainedImagePaths = data.existingImagePaths === undefined
                ? currentImagePaths
                : currentImagePaths.filter(imagePath => data.existingImagePaths?.includes(imagePath));
            const removedImagePaths = currentImagePaths.filter(imagePath => !retainedImagePaths.includes(imagePath));
            await db.Post.update({
                title: data.title,
                excerpt: data.excerpt,
                description: data.description
            }, { where: { id: data.id, userId: data.userId }, transaction });
            await imageService.deleteImages(data.id, removedImagePaths, transaction);
            await imageService.createImages(data.id, data.Images, transaction);
            return { success: true, removedImagePaths };
        });
    },
    deletePost: async (id, userId) => {
        const post = await db.Post.findOne({
            where: { id, userId },
            include: ["Images"]
        });
        if (!post) {
            return { success: false };
        }
        await db.Post.destroy({
            where: { id, userId },
        });
        const imagePaths = post.Images ? post.Images.map((img) => img.imagePath) : [];
        return {
            success: true,
            imagePaths: imagePaths
        };
    },
    toggleLike: async (postId, userId) => {
        const existingLike = await db.PostLikes.findOne({
            where: { postId, userId }
        });
        if (existingLike) {
            await db.PostLikes.destroy({
                where: { postId, userId }
            });
            return { liked: false };
        }
        else {
            await db.PostLikes.create({ postId, userId });
            return { liked: true };
        }
    },
};
//# sourceMappingURL=post.service.js.map