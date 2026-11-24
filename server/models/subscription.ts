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
import type { Price } from "@/models/price.js";
import type { Order } from "@/models/order.js";

export type SubscriptionStatus =
	| "incomplete"
	| "incomplete_expired"
	| "trialing"
	| "active"
	| "past_due"
	| "canceled"
	| "unpaid"
	| "paused";

export class Subscription extends Model<
	InferAttributes<Subscription>,
	InferCreationAttributes<Subscription>
> {
	declare id: CreationOptional<number>;
	declare userId: ForeignKey<User["id"]>;
	declare priceId: ForeignKey<Price["id"]>;
	declare stripeSubscriptionId: string;
	declare status: CreationOptional<SubscriptionStatus>;
	declare currentPeriodStart: Date;
	declare currentPeriodEnd: Date;
	declare cancelAtPeriodEnd: CreationOptional<boolean>;
	declare canceledAt: CreationOptional<Date | null>;

	declare User?: NonAttribute<User>;
	declare Price?: NonAttribute<Price>;
	declare Orders?: NonAttribute<Order[]>;

	declare static associations: {
		User: Association<Subscription, User>;
		Price: Association<Subscription, Price>;
		Orders: Association<Subscription, Order>;
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
				priceId: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				stripeSubscriptionId: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				status: {
					type: DataTypes.STRING(30),
					allowNull: false,
					defaultValue: "incomplete",
					validate: {
						isIn: [
							[
								"incomplete",
								"incomplete_expired",
								"trialing",
								"active",
								"past_due",
								"canceled",
								"unpaid",
								"paused",
							],
						],
					},
				},
				currentPeriodStart: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				currentPeriodEnd: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				cancelAtPeriodEnd: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				canceledAt: {
					type: DataTypes.DATE,
					allowNull: true,
					defaultValue: null,
				},
			},
			{
				sequelize,
				modelName: "Subscription",
			}
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.belongsTo(registry.User as any, {
			foreignKey: "userId",
			as: "User",
		});

		this.belongsTo(registry.Price as any, {
			foreignKey: "priceId",
			as: "Price",
		});

		this.hasMany(registry.Order as any, {
			foreignKey: "subscriptionId",
			as: "Orders",
		});
	}
}