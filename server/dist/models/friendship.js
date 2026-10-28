import { Model, DataTypes } from "sequelize";
export class Friendship extends Model {
    static initialize(sequelize) {
        this.init({
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
        }, {
            sequelize,
            modelName: "Friendship",
            indexes: [{ unique: true, fields: ["userId", "friendId"] }],
            hooks: {
                beforeValidate: (friendship) => {
                    if (friendship.userId && friendship.friendId) {
                        const uId = friendship.userId;
                        const fId = friendship.friendId;
                        friendship.userId = Math.min(uId, fId);
                        friendship.friendId = Math.max(uId, fId);
                    }
                }
            },
            validate: {
                userIdLessThanFriendId() {
                    if (this.userId >= this.friendId) {
                        throw new Error("userId must always be less than friendId.");
                    }
                }
            }
        });
    }
    static configureAssociations() { }
}
//# sourceMappingURL=friendship.js.map