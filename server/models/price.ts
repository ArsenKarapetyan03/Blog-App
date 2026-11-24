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

export type PriceType = "one_time" | "recurring";
export type PriceInterval = "day" | "week" | "month" | "year";

export class Price extends Model<
	InferAttributes<Price>,
	InferCreationAttributes<Price>
> {
	declare id: CreationOptional<number>;
	declare productId: ForeignKey<Product["id"]>;
	declare stripePriceId: string;
	declare unitAmount: number;
	declare currency: string;
	declare type: CreationOptional<PriceType>;
	declare interval: CreationOptional<PriceInterval | null>;
	declare intervalCount: CreationOptional<number | null>;
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
				type: {
					type: DataTypes.STRING(20),
					allowNull: false,
					defaultValue: "one_time",
					validate: {
						isIn: [["one_time", "recurring"]],
					},
				},
				interval: {
					type: DataTypes.STRING(20),
					allowNull: true,
					defaultValue: null,
					validate: {
						isIn: [["day", "week", "month", "year"]],
					},
				},
				intervalCount: {
					type: DataTypes.INTEGER,
					allowNull: true,
					defaultValue: null,
					validate: {
						min: 1,
					},
				},
				active: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
				},
			},
			{
				sequelize,
				modelName: "Price",
				validate: {
					validBillingCombination(this: Price) {
						if (
							this.type === "one_time" &&
							(this.interval != null || this.intervalCount != null)
						) {
							throw new Error(
								"One-time prices cannot have an interval or intervalCount."
							);
						}
						if (
							this.type === "recurring" &&
							(!this.interval || !this.intervalCount)
						) {
							throw new Error(
								"Recurring prices must specify both interval and intervalCount."
							);
						}
					},
				},
			}
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

		this.hasMany(registry.Subscription as any, {
			foreignKey: "priceId",
			as: "Subscriptions",
		});
	}
}