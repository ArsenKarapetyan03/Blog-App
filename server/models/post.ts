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

	static initialize(sequelize: Sequelize) {
		this.init({
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
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.User as any, {
			foreignKey: "userId",
			as: "User",
		});

		this.hasMany(registry.Comment as any, {
			foreignKey: "postId",
			as: "Comments",
			onDelete: "CASCADE"
		});

		this.hasMany(registry.Image as any, {
			foreignKey: "postId",
			as: "Images",
			onDelete: "CASCADE"
		});

		this.belongsToMany(registry.User as any, {
			through: "PostLikes",
			foreignKey: "postId",
			otherKey: "userId",
			as: "LikedByUsers"
		});
	}
}
