import {
	Model, DataTypes, type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type ForeignKey,
	type Association
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

	declare static associations: {
		Post: Association<Comment, Post>;
		User: Association<Comment, User>;
	};

	static associate(models: { Post: typeof Post; User: typeof User }) {
		this.belongsTo(models.Post, {foreignKey: "postId", as: "Post"});
		this.belongsTo(models.User, {foreignKey: "userId", as: "User"});
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
			}
		},
		{
			sequelize,
			modelName: "Comment",
		}
	);

	return Comment;
}
