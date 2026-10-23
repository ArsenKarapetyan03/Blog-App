"use strict"

import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
  type CreationOptional,
  type ForeignKey
} from "sequelize";
import type { User } from "@/models/user.js";

type FriendshipStatus = "pending" | "accepted" | "blocked";

export class Friendship extends Model<
  InferAttributes<Friendship>,
  InferCreationAttributes<Friendship>
  >
  {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User["id"]>;
    declare friendId: ForeignKey<User["id"]>;
    declare status: CreationOptional<FriendshipStatus>;
}

export function initFriendship(sequelize: Sequelize) {
  Friendship.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE",
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "blocked"),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: "Friendship",
    indexes: [
      {
        unique: true,
        fields: ["userId", "friendId"],
      },
    ]
  });
  return Friendship;
}
