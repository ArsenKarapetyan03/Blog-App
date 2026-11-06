import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type Sequelize,
  type ForeignKey,
} from "sequelize";

export class ChatMember extends Model<
  InferAttributes<ChatMember>,
  InferCreationAttributes<ChatMember>
> {
  declare id: CreationOptional<number>;
  declare chatId: ForeignKey<number>;
  declare userId: ForeignKey<number>;
  declare role: CreationOptional<string>;
  declare lastReadAt: CreationOptional<Date | null>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        chatId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "member",
        },
        lastReadAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: "ChatMember",
        indexes: [
          {
            unique: true,
            fields: ["chatId", "userId"],
          },
        ],
      }
    );
  }

  static configureAssociations(): void {
    const registry = this.sequelize!.models;

    this.belongsTo(registry.Chat as any, {
      foreignKey: "chatId",
      as: "chat",
    });

    this.belongsTo(registry.User as any, {
      foreignKey: "userId",
      as: "user",
    });
  }
}
