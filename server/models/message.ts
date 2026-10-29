import {
	DataTypes,
	Model,
  type InferAttributes,
  type InferCreationAttributes,
	type CreationOptional,
  type Sequelize,
  type ForeignKey,
} from "sequelize";

export class Message extends Model<
	InferAttributes<Message>,
	InferCreationAttributes<Message>
> {
  declare id: CreationOptional<number>;
  declare senderId: ForeignKey<number>;
  declare receiverId: ForeignKey<number>;
  declare messageText: string;
  declare isRead: CreationOptional<boolean>;

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
        receiverId: {
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

    this.belongsTo(registry.User as any, {
      foreignKey: "receiverId",
      as: "receiver",
    })
  }
}