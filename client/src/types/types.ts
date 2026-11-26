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

export interface MessageType {
	id: number;
	messageText: string;
	isRead: boolean;
	isDeleted: boolean;
	chatId: number;
	senderId: number;
	createdAt: string;
	updatedAt: string;
	clientSideId?: string;
}

export interface ChatType {
	id: number;
	title: string;
	isGroup: boolean;
	users: UserType[];
	adminId?: number;
	lastMessage: MessageType;
	unreadCount: number;
	updatedAt: string;
}

export interface Price {
	id: number;
	unitAmount: number;
	currency: string;
	type?: "recurring" | "one_time";
	interval?: "day" | "week" | "month" | "year" | null;
	intervalCount?: number | null | undefined;
	Product?: Product;
}

export interface Product {
	id: number;
	name: string;
	description: string | null;
	active?: boolean;
	Seller?: UserType;
	Prices?: Price[];
	createdAt: string;
	updatedAt: string;
}

export interface CartItem {
	productId: string | number;
	priceId: string | number;
	name: string;
	unitAmount: number;
	currency: string;
	quantity: number;
}

export interface OrderItem {
	id: number;
	quantity: number;
	unitAmount: number;
	Price?: Partial<Price>;
}

export interface Order {
	id: number;
	totalAmount: number;
	currency: string;
	createdAt: string;
	Status?: {
		code: string;
		label: string;
	};
	Items: OrderItem[];
}

export type SubscriptionStatus =
	| "incomplete"
	| "incomplete_expired"
	| "trialing"
	| "active"
	| "past_due"
	| "canceled"
	| "unpaid"
	| "paused";

export interface Subscription {
	id: number;
	status: SubscriptionStatus;
	currentPeriodStart: string;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
	canceledAt: string | null;
	Price?: Price;
}