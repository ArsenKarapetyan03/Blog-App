import { Model, DataTypes } from "sequelize";
export class Friendship extends Model {
    static initialize(sequelize) {
        this.init({
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
        }, {
            sequelize,
            modelName: "Friendship",
            indexes: [{ unique: true, fields: ["requesterId", "receiverId"] }],
            validate: {
                noSelfFriendship() {
                    if (this.requesterId && this.receiverId && this.requesterId === this.receiverId) {
                        throw new Error("You cannot send a friend request to yourself.");
                    }
                }
            }
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.User, {
            foreignKey: "requesterId",
            as: "requester",
        });
        this.belongsTo(registry.User, {
            foreignKey: "receiverId",
            as: "receiver",
        });
    }
}
//# sourceMappingURL=friendship.js.map