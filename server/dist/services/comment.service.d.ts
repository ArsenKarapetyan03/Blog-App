export type CommentTreeNode = {
    id: number;
    postId: number;
    replyId: number | null;
    Replies: CommentTreeNode[];
};
export declare const commentService: {
    createComment: (commentData: {
        content: string;
        postId: number;
        userId: number;
        replyId?: number | null;
    }) => Promise<import("../models/comment.js").Comment | null>;
    findById: (id: number) => Promise<import("../models/comment.js").Comment | null>;
    getCommentsTree: (postId: number) => Promise<CommentTreeNode[]>;
    deleteComment: (id: number) => Promise<number>;
};
//# sourceMappingURL=comment.service.d.ts.map