import db from "#models/index.js";

export type CommentTreeNode = {
	id: number;
	postId: number;
	replyId: number | null;
	Replies: CommentTreeNode[];
	[key: string]: unknown;
};

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

	getCommentsTree: async (postId: number): Promise<CommentTreeNode[]> => {
		const comments = await db.Comment.findAll({
			where: {postId},
			include: [{
				model: db.User,
				as: "User",
				attributes: ["id", "name", "email"]
			}],
			order: [["createdAt", "ASC"], ["id", "ASC"]]
		});

		const commentsById = new Map<number, CommentTreeNode>();

		const treeComments = comments.map(comment => {
			const node = {...comment.toJSON(), Replies: [] as CommentTreeNode[]};
			commentsById.set(comment.id, node);
			return node;
		});
		const rootComments: CommentTreeNode[] = [];

		for (const comment of treeComments) {
			const parent = comment.replyId === null ? undefined : commentsById.get(comment.replyId);

			if (parent && parent.id !== comment.id) {
				parent.Replies.push(comment);
			} else {
				rootComments.push(comment);
			}
		}

		return rootComments;
	},

	deleteComment: async (id: number) => {
		return await db.Comment.destroy({where: {id}});
	}
};
