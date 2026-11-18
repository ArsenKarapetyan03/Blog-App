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
import type { OrderItem } from "./orderitem.js";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export class Order extends Model<
	InferAttributes<Order>,
	InferCreationAttributes<Order>
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare stripeCheckoutSessionId: CreationOptional<string | null>;
	declare stripePaymentIntentId: CreationOptional<string | null>;
	declare status: CreationOptional<OrderStatus>;
	declare totalAmount: number;
	declare currency: string;

	declare User?: NonAttribute<User>;
	declare Items?: NonAttribute<OrderItem[]>;

	declare static associations: {
		User: Association<Order, User>;
		Items: Association<Order, OrderItem>;
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
				},
				stripeCheckoutSessionId: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				},
				stripePaymentIntentId: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				},
				status: {
					type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
					allowNull: false,
					defaultValue: "pending",
				},
				totalAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				currency: {
					type: DataTypes.STRING(3),
					allowNull: false,
					defaultValue: "usd",
				},
			},
			{ sequelize, modelName: "Order" }
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.User as any, {
			foreignKey: "userId",
			as: "User",
		});

		this.hasMany(registry.OrderItem as any, {
			foreignKey: "orderId",
			as: "Items",
		});
	}
}