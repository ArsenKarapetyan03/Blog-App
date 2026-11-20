import {
	Model,
	DataTypes,
	type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type Association,
} from "sequelize";
import type { Post } from "./post.js";
import type { Comment } from "./comment.js";
import type { Message } from "./message.js";
import type { Chat } from "./chat.js";
import type { ChatMember } from "./chatmember.js";
import type { Order } from "./order.js";
import type { SellerBalance } from "./sellerbalance.js";

export class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare email: string;
	declare password: string;
	declare stripeCustomerId: CreationOptional<string | null>;

	declare Posts?: NonAttribute<Post[]>;
	declare Comments?: NonAttribute<Comment[]>;
	declare SentMessages?: NonAttribute<Message[]>;
	declare chats?: NonAttribute<Chat[]>;
	declare memberships?: NonAttribute<ChatMember[]>;
	declare LikedPosts?: NonAttribute<Post[]>;
	declare FriendsAsRequester?: NonAttribute<User[]>;
	declare FriendsAsReceiver?: NonAttribute<User[]>;
	declare IncomingRequests?: NonAttribute<User[]>;
	declare OutgoingRequests?: NonAttribute<User[]>;
	declare Orders?: NonAttribute<Order[]>;
	declare SellerBalance?: NonAttribute<SellerBalance>;

	declare static associations: {
		Posts: Association<User, Post>;
		Comments: Association<User, Comment>;
		SentMessages: Association<User, Message>;
		chats: Association<User, Chat>;
		memberships: Association<User, ChatMember>;
		LikedPosts: Association<User, Post>;
		FriendsAsRequester: Association<User, User>;
		FriendsAsReceiver: Association<User, User>;
		IncomingRequests: Association<User, User>;
		OutgoingRequests: Association<User, User>;
		Orders: Association<User, Order>;
		SellerBalance: Association<User, SellerBalance>;
	};

	get Friends(): NonAttribute<User[]> {
		return [...(this.FriendsAsRequester || []), ...(this.FriendsAsReceiver || [])];
	}

	static initialize(sequelize: Sequelize) {
		this.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true
				},
				password: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				stripeCustomerId: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				},
			},
			{sequelize, modelName: "User"}
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.hasOne(registry.SellerBalance as any, {
			foreignKey: "userId",
			as: "SellerBalance",
		});

		this.hasMany(registry.Post as any, {
			foreignKey: "userId",
			as: "Posts",
		});

		this.hasMany(registry.Comment as any, {
			foreignKey: "userId",
			as: "Comments"
		});

		this.hasMany(registry.Message as any, {
			foreignKey: "senderId",
			as: "SentMessages",
		});

		this.hasMany(registry.ChatMember as any, {
			foreignKey: "userId",
			as: "memberships",
		});

		this.hasMany(registry.Order as any, {
			foreignKey: "userId",
			as: "Orders",
		});

		this.hasMany(registry.Product as any, {
			foreignKey: "userId",
			as: "Products"
		});

		this.belongsToMany(registry.Chat as any, {
			through: registry.ChatMember as any,
			foreignKey: "userId",
			otherKey: "chatId",
			as: "chats",
		});

		this.belongsToMany(registry.Post as any, {
			through: "PostLikes",
			foreignKey: "userId",
			otherKey: "postId",
			as: "LikedPosts"
		});

		this.belongsToMany(this, {
			as: "FriendsAsRequester",
			through: {
				model: "Friendship",
				scope: {
					status: "accepted",
				}
			},
			foreignKey: "requesterId",
			otherKey: "receiverId",
		});

		this.belongsToMany(this, {
			as: "FriendsAsReceiver",
			through: {
				model: "Friendship",
				scope: {
					status: "accepted",
				}
			},
			foreignKey: "receiverId",
			otherKey: "requesterId",
		})

		this.belongsToMany(this, {
			as: "IncomingRequests",
			through: {
				model: "Friendship",
				scope: { status: "pending" }
			},
			foreignKey: "receiverId",
			otherKey: "requesterId",
		});

		this.belongsToMany(this, {
			as: "OutgoingRequests",
			through: {
				model: "Friendship",
				scope: { status: "pending" }
			},
			foreignKey: "requesterId",
			otherKey: "receiverId",
		});
	}
}