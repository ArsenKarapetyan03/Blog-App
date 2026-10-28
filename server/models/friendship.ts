import {
  Model,
  DataTypes,
  type Sequelize,
  type CreationOptional,
  type NonAttribute
} from "sequelize";
import type { User } from "@/models/user.js";

type FriendshipStatus = "pending" | "accepted" | "blocked";

export class Friendship extends Model {
  declare id: CreationOptional<number>;
  declare requesterId: number;
  declare receiverId: number;
  declare status: CreationOptional<FriendshipStatus>;

  declare requester?: NonAttribute<User>;
  declare receiver?: NonAttribute<User>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        requesterId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
          onDelete: "CASCADE",
        },
        receiverId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
          onDelete: "CASCADE",
        },
        status: {
          type: DataTypes.ENUM("pending", "accepted", "blocked"),
          allowNull: false,
          defaultValue: "pending",
        },
      },
      {
        sequelize,
        modelName: "Friendship",
        indexes: [{ unique: true, fields: ["requesterId", "receiverId"] }],
        validate: {
          noSelfFriendship(this: Friendship) {
            if (this.requesterId && this.receiverId && this.requesterId === this.receiverId) {
              throw new Error("You cannot send a friend request to yourself.");
            }
          }
        }
      }
    );
  }

  static configureAssociations() {
    const registry = this.sequelize!.models;

    this.belongsTo(registry.User as any, {
      foreignKey: "requesterId",
      as: "requester",
    });

    this.belongsTo(registry.User as any, {
      foreignKey: "receiverId",
      as: "receiver",
    });
  }
}
