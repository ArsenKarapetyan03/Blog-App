import { Model, DataTypes } from "sequelize";
export class Post extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: "userId",
            as: "User",
        });
        this.hasMany(models.Comment, {
            foreignKey: "postId",
            as: "Comments",
            onDelete: "CASCADE"
        });
        this.hasMany(models.Image, {
            foreignKey: "postId",
            as: "Images",
            onDelete: "CASCADE"
        });
        this.belongsToMany(models.User, {
            through: models.PostLikes,
            foreignKey: "postId",
            otherKey: "userId",
            as: "LikedByUsers"
        });
    }
}
export function initPost(sequelize) {
    Post.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: DataTypes.STRING,
        excerpt: DataTypes.TEXT,
        description: DataTypes.TEXT,
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE"
        }
    }, {
        sequelize,
        modelName: "Post",
        defaultScope: {
            include: [
                {
                    association: "User",
                    attributes: ["name"]
                }
            ]
        }
    });
    return Post;
}
//# sourceMappingURL=post.js.map