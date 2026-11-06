import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type Sequelize,
  type ForeignKey, type NonAttribute,
} from "sequelize";
import type { User } from "@/models/user.js";

export class Message extends Model<
	InferAttributes<Message>,
	InferCreationAttributes<Message>
> {
  declare id: CreationOptional<number>;
  declare senderId: ForeignKey<number>;
  declare chatId: ForeignKey<number>;
  declare messageText: string;
  declare isRead: CreationOptional<boolean>;
  declare isDeleted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare sender: NonAttribute<User>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        senderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        chatId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        messageText: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
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
        modelName: "Message"
      }
    );
  }

  static configureAssociations(): void {
    const registry = this.sequelize!.models;

    this.belongsTo(registry.User as any, {
      foreignKey: "senderId",
      as: "sender",
    });

    this.belongsTo(registry.Chat as any, {
      foreignKey: "chatId",
      as: "chat",
    });
  }
}