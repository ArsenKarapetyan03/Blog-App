import {
  Model,
  DataTypes,
  type Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  type Association,
  type ForeignKey,
} from "sequelize";
import type { Price } from "@/models/price.js";
import type { User } from "@/models/user.js";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare stripeProductId: string;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare active: CreationOptional<boolean>;

  declare Prices?: NonAttribute<Price[]>;
  declare Seller?: NonAttribute<User>;

  declare static associations: {
    Prices: Association<Product, Price>;
    Seller: Association<Product, User>;
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
        stripeProductId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      { sequelize, modelName: "Product" }
    );
  }

  static configureAssociations() {
    const registry = this.sequelize!.models;

    this.hasMany(registry.Price as any, {
      foreignKey: "productId",
      as: "Prices",
    });

    this.belongsTo(registry.User as any, {
      foreignKey: "userId",
      as: "Seller"
    })
  }
}