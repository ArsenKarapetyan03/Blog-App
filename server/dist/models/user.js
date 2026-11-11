import { Model, DataTypes, } from "sequelize";
export class User extends Model {
    get Friends() {
        return [...(this.FriendsAsRequester || []), ...(this.FriendsAsReceiver || [])];
    }
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, { sequelize, modelName: "User" });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.hasMany(registry.Post, {
            foreignKey: "userId",
            as: "Posts",
        });
        this.hasMany(registry.Comment, {
            foreignKey: "userId",
            as: "Comments"
        });
        this.hasMany(registry.Message, {
            foreignKey: "senderId",
            as: "SentMessages",
        });
        this.hasMany(registry.ChatMember, {
            foreignKey: "userId",
            as: "memberships",
        });
        this.belongsToMany(registry.Chat, {
            through: registry.ChatMember,
            foreignKey: "userId",
            otherKey: "chatId",
            as: "chats",
        });
        this.belongsToMany(registry.Post, {
            through: "PostLikes",
            foreignKey: "userId",
            otherKey: "postId",
            as: "LikedPosts"
        });
        this.belongsToMany(this, {
            as: "FriendsAsRequester",
            through: {
                model: "Friendship",
                scope: {
                    status: "accepted",
                }
            },
            foreignKey: "requesterId",
            otherKey: "receiverId",
        });
        this.belongsToMany(this, {
            as: "FriendsAsReceiver",
            through: {
                model: "Friendship",
                scope: {
                    status: "accepted",
                }
            },
            foreignKey: "receiverId",
            otherKey: "requesterId",
        });
        this.belongsToMany(this, {
            as: "IncomingRequests",
            through: {
                model: "Friendship",
                scope: { status: "pending" }
            },
            foreignKey: "receiverId",
            otherKey: "requesterId",
        });
        this.belongsToMany(this, {
            as: "OutgoingRequests",
            through: {
                model: "Friendship",
                scope: { status: "pending" }
            },
            foreignKey: "requesterId",
            otherKey: "receiverId",
        });
    }
}
//# sourceMappingURL=user.js.map