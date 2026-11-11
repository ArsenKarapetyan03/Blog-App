import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type Sequelize,
  type NonAttribute,
} from "sequelize";
import type { Message } from "@/models/message.js";
import type { User } from "@/models/user.js";
import type { ChatMember } from "@/models/chatmember.js";

export class Chat extends Model<
  InferAttributes<Chat, { omit: "messages" | "users" | "memberships" }>,
  InferCreationAttributes<Chat, { omit: "messages" | "users" | "memberships" }>
> {
  declare id: CreationOptional<number>;
  declare title: string | null;
  declare isGroup: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare users: NonAttribute<User[]>;
  declare messages: NonAttribute<Message[]>;
  declare memberships: NonAttribute<ChatMember[]>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isGroup: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Chat",
      }
    );
  }

  static configureAssociations(): void {
    const registry = this.sequelize!.models;

    this.hasMany(registry.Message as any, {
      foreignKey: "chatId",
      as: "messages",
      onDelete: "CASCADE",
    });

    this.hasMany(registry.ChatMember as any, {
      foreignKey: "chatId",
      as: "memberships",
    });

    this.belongsToMany(registry.User as any, {
      through: registry.ChatMember as any,
      foreignKey: "chatId",
      otherKey: "userId",
      as: "users",
    });
  }
}
