import { Model, DataTypes } from "sequelize";
export class Comment extends Model {
    static associate(models) {
        this.belongsTo(models.Post, { foreignKey: "postId", as: "Post" });
        this.belongsTo(models.User, { foreignKey: "userId", as: "User" });
        this.belongsTo(models.Comment, { foreignKey: "replyId", as: "ParentComment" });
        this.hasMany(models.Comment, { foreignKey: "replyId", as: "Replies" });
    }
}
export function initComment(sequelize) {
    Comment.init({
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
    return Comment;
}
//# sourceMappingURL=comment.js.map