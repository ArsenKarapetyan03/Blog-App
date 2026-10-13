import {
	Model, DataTypes, type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type Association,
	type ForeignKey
} from "sequelize";
import type { User } from "./user.js";
import type { Comment } from "./comment.js";

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

	declare static associations: {
		User: Association<Post, User>;
		Comments: Association<Post, Comment>;
	};

	static associate(models: {User: typeof User; Comment: typeof Comment}) {
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "User",
		});

		this.hasMany(models.Comment, {
			foreignKey: "postId",
			as: "Comments",
			onDelete: "CASCADE"
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
			userId: DataTypes.INTEGER
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