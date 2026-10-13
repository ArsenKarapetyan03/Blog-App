export interface User {
	id: number;
	name: string;
	email: string;
}

export interface Comment {
	id: number;
	content: string;
	postId: number;
	userId: number
	createdAt: string;
	updatedAt: string;
	User: User;
}

export interface PostType {
	id: number;
	title: string;
	User: User;
	createdAt: string;
	updatedAt: string;
	excerpt: string;
	description: string;
	Comments: Comment[];
	userId: number;
}