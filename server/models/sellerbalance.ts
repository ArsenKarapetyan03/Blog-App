import {
	Model,
	DataTypes,
	type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type ForeignKey,
	type NonAttribute,
	type Association,
} from "sequelize";
import type { User } from "./user.js";

export class SellerBalance extends Model<
	InferAttributes<SellerBalance>,
	InferCreationAttributes<SellerBalance>
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare availableAmount: CreationOptional<number>;
	declare pendingAmount: CreationOptional<number>;
	declare currency: CreationOptional<string>;

	declare User?: NonAttribute<User>;

	declare static associations: {
		User: Association<SellerBalance, User>;
	};

	static initialize(sequelize: Sequelize) {
		this.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true,
				},
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false,
					unique: true,
				},
				availableAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				pendingAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				currency: {
					type: DataTypes.STRING(3),
					allowNull: false,
					defaultValue: "usd",
				},
			},
			{ sequelize, modelName: "SellerBalance" }
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.User as any, {
			foreignKey: "userId",
			as: "User",
		});
	}
}