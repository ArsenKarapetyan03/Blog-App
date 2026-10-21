"use strict"

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
import { type Post } from "@/models/post.js";

export class Image extends Model<
	InferAttributes<Image>,
	InferCreationAttributes<Image>
> {
	declare id: CreationOptional<number>;
	declare postId: ForeignKey<Post["id"]>;
	declare imagePath: string;

	static associate(models: Model<Image>) {

	}
}

export function initImage(sequelize: Sequelize) {
	Image.init({
		id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
		postId: DataTypes.NUMBER,
		imagePath: DataTypes.STRING
	}, {
		sequelize,
		modelName: "Image"
	})
	return Image;
}