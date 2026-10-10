import {
	Model, DataTypes, type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type Association,
	type ForeignKey
} from "sequelize";
import type {User} from "./user.js";

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
	declare author: CreationOptional<string | null>;

	declare static associations: {
		User: Association<Post, User>;
	};

	static associate(models: { User: typeof User }) {
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "User",
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
			userId: DataTypes.INTEGER,
			author: {
				type: DataTypes.VIRTUAL,
				get(this: Post) {
					return this.User?.name ?? null;
				}
			},
		},
		{
			sequelize,
			modelName: "Post",
		}
	);

	return Post;
}