import db from "#models/index.js";

export const commentService = {
	createComment: async (commentData: { content: string; postId: number; userId: number; replyId?: number | null }) => {
		const { content, postId, userId, replyId } = commentData;

		const newComment = await db.Comment.create({
			content,
			postId,
			userId,
			replyId: replyId || null
		});

		return await db.Comment.findByPk(newComment.id, {
			include: [{
				model: db.User,
				as: "User",
				attributes: ["id", "name", "email"]
			}]
		});
	},

	findById: async (id: number) => {
		return await db.Comment.findByPk(id, {
			include: [{
				model: db.User,
				as: "User",
				attributes: ["id", "name", "email"]
			}]
		});
	},

	getPostWithTreeComments: async (postId: number) => {
		const post = await db.Post.findByPk(postId, {
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

	deleteComment: async (id: number) => {
		return await db.Comment.destroy({ where: { id } });
	}
};
