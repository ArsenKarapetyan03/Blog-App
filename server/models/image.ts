"use strict";

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

	static initialize(sequelize: Sequelize) {
		this.init({
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			postId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Posts",
					key: "id",
				},
				onDelete: "CASCADE"
			},
			imagePath: {
				type: DataTypes.STRING,
				allowNull: false
			}
		}, {
			sequelize,
			modelName: "Image"
		});
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.Post as any, {
			foreignKey: "postId",
			as: "post"
		});
	}
}
