import { Model, DataTypes } from "sequelize";
export class PostLikes extends Model {
    static initialize(sequelize) {
        this.init({
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
                    key: "id"
                }
            },
        }, {
            sequelize,
            modelName: "PostLikes",
            tableName: "PostLikes",
            timestamps: false,
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.Post, { foreignKey: "postId" });
        this.belongsTo(registry.User, { foreignKey: "userId" });
    }
}
//# sourceMappingURL=postlikes.js.map