import { Model, DataTypes } from "sequelize";
export class PostLikes extends Model {
    static associate(models) {
        this.belongsTo(models.Post, { foreignKey: "postId" });
        this.belongsTo(models.User, { foreignKey: "userId" });
    }
}
export function initPostLikes(sequelize) {
    PostLikes.init({
        postId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "Posts",
                key: "id"
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "Users",
                key: "userId"
            }
        },
    }, {
        sequelize,
        modelName: "PostLikes",
        tableName: "PostLikes",
        timestamps: false,
    });
    return PostLikes;
}
//# sourceMappingURL=postlikes.js.map