import { Model, DataTypes } from "sequelize";
export class Comment extends Model {
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.Post, { foreignKey: "postId", as: "Post" });
        this.belongsTo(registry.User, { foreignKey: "userId", as: "User" });
        this.belongsTo(this, { foreignKey: "replyId", as: "ParentComment" });
        this.hasMany(this, { foreignKey: "replyId", as: "Replies" });
    }
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Posts",
                    key: "id"
                },
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id"
                },
            },
            replyId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "Comments",
                    key: "id"
                },
                onDelete: "CASCADE"
            }
        }, {
            sequelize,
            modelName: "Comment",
        });
    }
}
//# sourceMappingURL=comment.js.map