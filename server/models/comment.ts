import {
	Model, DataTypes, type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type ForeignKey,
	type Association,
	type NonAttribute
} from "sequelize";
import type { Post } from "./post.js";
import type { User } from "./user.js";
import type { PostLikes } from "@/models/postlikes.js";

export class Comment extends Model<
	InferAttributes<Comment>,
	InferCreationAttributes<Comment>
> {
	declare id: CreationOptional<number>;
	declare content: string;
	declare postId: ForeignKey<Post["id"]>;
	declare userId: ForeignKey<User["id"]>;
	declare replyId: CreationOptional<ForeignKey<Comment["id"]> | null>;

	declare User?: NonAttribute<User | null>;
	declare Post?: NonAttribute<Post | null>;
	declare ParentComment?: NonAttribute<Comment | null>;
	declare Replies?: NonAttribute<Comment[]>;

	declare static associations: {
		Post: Association<Comment, Post>;
		User: Association<Comment, User>;
		ParentComment: Association<Comment, Comment>;
		Replies: Association<Comment, Comment>;
	};

	static associate(models: {
		Post: typeof Post;
		User: typeof User;
		Comment: typeof Comment;
		PostLikes: typeof PostLikes;
	}) {
		this.belongsTo(models.Post, {foreignKey: "postId", as: "Post"});
		this.belongsTo(models.User, {foreignKey: "userId", as: "User"});
		this.belongsTo(models.Comment, { foreignKey: "replyId", as: "ParentComment" });
		this.hasMany(models.Comment, { foreignKey: "replyId", as: "Replies" });
	}
}

export function initComment(sequelize: Sequelize): typeof Comment {
	Comment.init({
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			postId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			replyId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "Comments",
					key: "id"
				},
				onDelete: "CASCADE"
			}
		},
		{
			sequelize,
			modelName: "Comment",
		}
	);

	return Comment;
}
