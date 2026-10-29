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

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.Post as any, {foreignKey: "postId", as: "Post"});
		this.belongsTo(registry.User as any, {foreignKey: "userId", as: "User"});
		this.belongsTo(this, {foreignKey: "replyId", as: "ParentComment"});
		this.hasMany(this, {foreignKey: "replyId", as: "Replies"});
	}

	static initialize(sequelize: Sequelize) {
		this.init({
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
					allowNull: false,
					references: {
						model: "Posts",
						key: "id"
					},
				},
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false,
					references: {
						model: "Users",
						key: "id"
					},
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
	}
}