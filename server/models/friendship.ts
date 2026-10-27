import {
  Model,
  DataTypes,
  type Sequelize,
  type CreationOptional
} from "sequelize";

type FriendshipStatus = "pending" | "accepted" | "blocked";

export class Friendship extends Model {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare friendId: number;
  declare senderId: number;
  declare status: CreationOptional<FriendshipStatus>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
        },
        friendId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
        },
        senderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
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
        indexes: [{unique: true, fields: ["userId", "friendId"]}],
        hooks: {
          beforeValidate: (friendship: Friendship) => {
            if (friendship.userId && friendship.friendId) {
              const uId = friendship.userId;
              const fId = friendship.friendId;

              friendship.userId = Math.min(uId, fId);
              friendship.friendId = Math.max(uId, fId);
            }
          }
        },
        validate: {
          userIdLessThanFriendId(this: Friendship) {
            if (this.userId >= this.friendId) {
              throw new Error("userId must always be less than friendId.");
            }
          }
        }
      }
    );
  }

  static configureAssociations() {}
}
