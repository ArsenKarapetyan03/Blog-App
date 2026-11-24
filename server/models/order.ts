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
import type { OrderItem } from "@/models/orderitem.js";
import type { OrderStatus } from "@/models/orderstatus.js";
import type { Subscription } from "@/models/subscription.js";

export class Order extends Model<
	InferAttributes<Order>,
	InferCreationAttributes<Order>
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare statusId: ForeignKey<OrderStatus["id"]>;
	declare stripeCheckoutSessionId: CreationOptional<string | null>;
	declare stripePaymentIntentId: CreationOptional<string | null>;
	declare totalAmount: number;
	declare currency: string;
	declare subscriptionId: CreationOptional<ForeignKey<Subscription["id"]> | null>;
	declare stripeInvoiceId: CreationOptional<string | null>;

	declare User?: NonAttribute<User>;
	declare Status?: NonAttribute<OrderStatus>;
	declare Items?: NonAttribute<OrderItem[]>;

	declare static associations: {
		User: Association<Order, User>;
		Status: Association<Order, OrderStatus>;
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
				statusId: {
					type: DataTypes.INTEGER,
					allowNull: false,
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
				subscriptionId: {
					type: DataTypes.INTEGER,
					allowNull: true,
					defaultValue: null,
				},
				stripeInvoiceId: {
					type: DataTypes.STRING,
					allowNull: true,
					unique: true,
				}
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

		this.belongsTo(registry.OrderStatus as any, {
			foreignKey: "statusId",
			as: "Status",
		});

		this.belongsTo(registry.Subscription as any, {
			foreignKey: "subscriptionId",
			as: "Subscription",
		});

		this.hasMany(registry.OrderItem as any, {
			foreignKey: "orderId",
			as: "Items",
		});
	}
}