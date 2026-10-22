"use strict"

import {
	Model,
	DataTypes,
	type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type ForeignKey
} from "sequelize";
import { type Post } from "@/models/post.js";

export class Image extends Model<
	InferAttributes<Image>,
	InferCreationAttributes<Image>
> {
	declare id: CreationOptional<number>;
	declare postId: ForeignKey<Post["id"]>;
	declare imagePath: string;

	declare post?: NonAttribute<Post>;

	static associate(models: {
		Post: typeof Post,
	}) {
		this.belongsTo(models.Post, {
			foreignKey: "postId",
			as: "post"
		})
	}
}

export function initImage(sequelize: Sequelize) {
	Image.init({
		id: {
      type: DataTypes.INTEGER,
			primaryKey: true,
      autoIncrement: true,
    },
		postId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Post",
				key: "id",
			}
		},
		imagePath: DataTypes.STRING
	}, {
		sequelize,
		modelName: "Image"
	})
	return Image;
}