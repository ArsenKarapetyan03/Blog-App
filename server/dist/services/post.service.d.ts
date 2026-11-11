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
    Images: {
        imagePath: string;
    }[];
}
interface UpdatePostInput extends CreatePostInput {
    id: number;
    existingImagePaths?: string[];
}
export declare const postService: {
    getPosts: ({ searchString, userId, limit, offset }: GetPostsFilters) => Promise<{
        posts: import("sequelize").InferAttributes<import("../models/post.js").Post, {
            omit: never;
        }>[];
        count: number;
    }>;
    getPostById: (id: number, currentUserId?: number) => Promise<{
        id: import("sequelize").CreationOptional<number>;
        title: string | null;
        excerpt: string | null;
        description: string | null;
        userId: import("sequelize").ForeignKey<import("../models/user.js").User['id'] | null>;
        Comments: import("@/services/comment.service.js").CommentTreeNode[];
        likesCount: number;
        isLikedByMe: boolean;
    } | null>;
    createPost: (data: CreatePostInput) => Promise<import("../models/post.js").Post>;
    updatePost: (data: UpdatePostInput) => Promise<{
        success: boolean;
        removedImagePaths: string[];
    }>;
    deletePost: (id: number, userId: number) => Promise<{
        success: boolean;
        imagePaths?: never;
    } | {
        success: boolean;
        imagePaths: string[];
    }>;
    toggleLike: (postId: number, userId: number) => Promise<{
        liked: boolean;
    }>;
};
export {};
//# sourceMappingURL=post.service.d.ts.map