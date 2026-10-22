export interface User {
	id: number;
	name: string;
	email: string;
}

export interface CommentType {
	id: number;
	content: string;
	postId: number;
	userId: number;
	replyId: number | null;
	createdAt: string;
	updatedAt: string;
	User: User;
	Replies?: CommentType[];
}

export interface PostType {
	id: number;
	title: string;
	User: User;
	excerpt: string;
	description: string;
	Images: {
		imagePath: string;
	}[];
	likesCount: number;
	isLikedByMe: boolean;
	Comments: CommentType[];
	userId: number;
	createdAt: string;
	updatedAt: string;
}