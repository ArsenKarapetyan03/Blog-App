import {
	Model,
	DataTypes,
	type Sequelize,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
	type Association,
} from "sequelize";
import type { Order } from "./order.js";

export const ORDER_STATUS_CODES = [
	"pending",
	"paid",
	"failed",
	"cancelled",
	"expired",
	"refunded",
	"shipped"
] as const;

export type OrderStatusCode = (typeof ORDER_STATUS_CODES)[number];

export const DEFAULT_STATUSES: Array<{ code: OrderStatusCode; label: string }> = [
	{ code: "pending", label: "Pending" },
	{ code: "paid", label: "Paid" },
	{ code: "failed", label: "Failed" },
	{ code: "cancelled", label: "Cancelled" },
	{ code: "expired", label: "Expired" },
	{ code: "refunded", label: "Refunded" },
	{ code: "shipped", label: "Shipped" },
];

export class OrderStatus extends Model<
	InferAttributes<OrderStatus>,
	InferCreationAttributes<OrderStatus>
> {
	declare id: CreationOptional<number>;
	declare code: OrderStatusCode;
	declare label: string;
	declare description: CreationOptional<string | null>;

	declare Orders?: NonAttribute<Order[]>;

	declare static associations: {
		Orders: Association<OrderStatus, Order>;
	};

	private static statusMapPromise: Promise<Record<OrderStatusCode, number>> | null = null;

	static async seedAndWarmCache(): Promise<void> {
		for (const item of DEFAULT_STATUSES) {
			await this.findOrCreate({
				where: { code: item.code },
				defaults: { code: item.code, label: item.label },
			});
		}
		this.statusMapPromise = null;
		await this.getStatusMap();
	}

	static getStatusMap(): Promise<Record<OrderStatusCode, number>> {
		if (!this.statusMapPromise) {
			this.statusMapPromise = this.findAll()
				.then((statuses) => {
					const map = {} as Record<OrderStatusCode, number>;
					for (const s of statuses) {
						map[s.code] = s.id;
					}

					for (const code of ORDER_STATUS_CODES) {
						if (!map[code]) {
							throw new Error(`OrderStatus '${code}' is missing from database`);
						}
					}

					return map;
				})
				.catch((err) => {
					this.statusMapPromise = null;
					throw err;
				});
		}

		return this.statusMapPromise;
	}

	static async getIdByCode(code: OrderStatusCode): Promise<number> {
		const map = await this.getStatusMap();
		return map[code];
	}

	static initialize(sequelize: Sequelize) {
		this.init(
			{
				id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true,
				},
				code: {
					type: DataTypes.STRING(32),
					allowNull: false,
					unique: true,
				},
				label: {
					type: DataTypes.STRING(64),
					allowNull: false,
				},
				description: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: "OrderStatus",
				timestamps: false
			}
		);
	}

	static configureAssociations() {
		const registry = this.sequelize!.models;

		this.hasMany(registry.Order as any, {
			foreignKey: "statusId",
			as: "Orders",
		});
	}
}