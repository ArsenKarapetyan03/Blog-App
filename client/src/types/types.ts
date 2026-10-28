export interface UserType {
	id: number;
	name: string;
	email: string;
	friends?: UserType[];
	incomingRequests?: UserType[];
	outgoingRequests?: UserType[];
}

export interface CommentType {
	id: number;
	content: string;
	postId: number;
	userId: number;
	replyId: number | null;
	createdAt: string;
	updatedAt: string;
	User: UserType;
	Replies?: CommentType[];
}

export interface PostType {
	id: number;
	title: string;
	User: UserType;
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