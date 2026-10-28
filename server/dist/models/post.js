import { Model, DataTypes } from "sequelize";
export class Post extends Model {
    static initialize(sequelize) {
        this.init({
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
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.User, {
            foreignKey: "userId",
            as: "User",
        });
        this.hasMany(registry.Comment, {
            foreignKey: "postId",
            as: "Comments",
            onDelete: "CASCADE"
        });
        this.hasMany(registry.Image, {
            foreignKey: "postId",
            as: "Images",
            onDelete: "CASCADE"
        });
        this.belongsToMany(registry.User, {
            through: "PostLikes",
            foreignKey: "postId",
            otherKey: "userId",
            as: "LikedByUsers"
        });
    }
}
//# sourceMappingURL=post.js.map