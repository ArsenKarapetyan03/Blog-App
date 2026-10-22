import {
	Model,
	DataTypes,
	type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type Association,
	type ForeignKey
} from "sequelize";
import type { User } from "./user.js";
import type { Comment } from "./comment.js";
import type { PostLikes } from "@/models/postlikes.js";
import type { Image } from "@/models/image.js";

export class Post extends Model<
	InferAttributes<Post>,
	InferCreationAttributes<Post>
> {
	declare id: CreationOptional<number>;
	declare title: string | null;
	declare excerpt: string | null;
	declare description: string | null;
	declare userId: ForeignKey<User['id'] | null>;

	declare User?: NonAttribute<User | null>;
	declare Comments?: NonAttribute<Comment[]>;
	declare LikedByUsers?: NonAttribute<User[]>;
	declare Images?: NonAttribute<Image[]>;

	declare static associations: {
		User: Association<Post, User>;
		Comments: Association<Post, Comment>;
		LikedByUsers: Association<Post, User>;
		Images: Association<Post, Image>;
	};

	static associate(models: {
		User: typeof User;
		Post: typeof Post;
		Comment: typeof Comment;
		PostLikes: typeof PostLikes;
		Image: typeof Image;
	}) {
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "User",
		});

		this.hasMany(models.Comment, {
			foreignKey: "postId",
			as: "Comments",
			onDelete: "CASCADE"
		});

		this.hasMany(models.Image, {
			foreignKey: "postId",
			as: "Images",
			onDelete: "CASCADE"
		})

		this.belongsToMany(models.User, {
			through: models.PostLikes,
			foreignKey: "postId",
			otherKey: "userId",
			as: "LikedByUsers"
		});
	}
}

export function initPost(sequelize: Sequelize): typeof Post {
	Post.init({
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			title: DataTypes.STRING,
			excerpt: DataTypes.TEXT,
			description: DataTypes.TEXT,
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Users",
					key: "id"
				},
				onDelete: "CASCADE"
			}
		},
		{
			sequelize,
			modelName: "Post",
			defaultScope: {
				include: [
					{
						association: "User",
						attributes: ["name"]
					}
				]
			}
		}
	);

	return Post;
}