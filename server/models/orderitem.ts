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
import type { Order } from "./order.js";
import type { Price } from "./price.js";

export class OrderItem extends Model<
	InferAttributes<OrderItem>,
	InferCreationAttributes<OrderItem>
> {
	declare id: CreationOptional<number>;
	declare orderId: ForeignKey<Order["id"]>;
	declare priceId: ForeignKey<Price["id"]>;
	declare quantity: number;
	declare unitAmount: number;

	declare Order?: NonAttribute<Order>;
	declare Price?: NonAttribute<Price>;

	declare static associations: {
		Order: Association<OrderItem, Order>;
		Price: Association<OrderItem, Price>;
	};

	static initialize(sequelize: Sequelize) {
		this.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true,
				},
				orderId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				priceId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				quantity: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 1,
				},
				unitAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
			},
			{ sequelize, modelName: "OrderItem" }
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.Order as any, {
			foreignKey: "orderId",
			as: "Order",
		});

		this.belongsTo(registry.Price as any, {
			foreignKey: "priceId",
			as: "Price",
		});
	}
}