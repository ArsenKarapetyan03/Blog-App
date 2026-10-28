import { Model, DataTypes, Op, col, } from "sequelize";
export class User extends Model {
    get Friends() {
        return [...(this.InitiatedFriends || []), ...(this.ReceivedFriends || [])];
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
        this.belongsToMany(registry.Post, {
            through: "PostLikes",
            foreignKey: "userId",
            otherKey: "postId",
            as: "LikedPosts"
        });
        this.belongsToMany(this, {
            as: "InitiatedFriends",
            through: {
                model: "Friendship",
                scope: {
                    status: "accepted",
                }
            },
            foreignKey: "userId",
            otherKey: "friendId",
        });
        this.belongsToMany(this, {
            as: "ReceivedFriends",
            through: {
                model: "Friendship",
                scope: {
                    status: "accepted",
                }
            },
            foreignKey: "friendId",
            otherKey: "userId",
        });
        this.belongsToMany(this, {
            as: "IncomingRequests",
            through: {
                model: "Friendship",
                scope: {
                    status: "pending",
                    senderId: { [Op.ne]: col("User.id") }
                }
            },
            foreignKey: "userId",
            otherKey: "friendId",
        });
        this.belongsToMany(this, {
            as: "OutgoingRequests",
            through: {
                model: "Friendship",
                scope: {
                    status: "pending",
                    senderId: { [Op.eq]: col("User.id") }
                }
            },
            foreignKey: "userId",
            otherKey: "friendId",
        });
    }
}
//# sourceMappingURL=user.js.map