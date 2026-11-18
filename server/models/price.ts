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
import type { Product } from "@/models/product.js";
import type { OrderItem } from "@/models/orderitem.js";

export class Price extends Model<
	InferAttributes<Price>,
	InferCreationAttributes<Price>
> {
	declare id: CreationOptional<number>;
	declare productId: ForeignKey<Product["id"]>;
	declare stripePriceId: string;
	declare unitAmount: number;
	declare currency: string;
	declare active: CreationOptional<boolean>;

	declare Product?: NonAttribute<Product>;
	declare OrderItems?: NonAttribute<OrderItem[]>;

	declare static associations: {
		Product: Association<Price, Product>;
		OrderItems: Association<Price, OrderItem>;
	};

	static initialize(sequelize: Sequelize) {
		this.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true,
				},
				productId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				stripePriceId: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				unitAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				currency: {
					type: DataTypes.STRING(3),
					allowNull: false,
					defaultValue: "usd",
				},
				active: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
			},
			{ sequelize, modelName: "Price" }
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.Product as any, {
			foreignKey: "productId",
			as: "Product",
		});

		this.hasMany(registry.OrderItem as any, {
			foreignKey: "priceId",
			as: "OrderItems",
		});
	}
}
