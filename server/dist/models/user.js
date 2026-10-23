import { Model, DataTypes, } from "sequelize";
export class User extends Model {
    static associate(models) {
        this.hasMany(models.Post, {
            foreignKey: "userId",
            as: "Posts",
        });
        this.hasMany(models.Comment, {
            foreignKey: "userId",
            as: "Comments"
        });
        this.belongsToMany(models.Post, {
            through: models.PostLikes,
            foreignKey: "userId",
            otherKey: "postId",
            as: "LikedPosts"
        });
    }
}
export function initUser(sequelize) {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: "User",
    });
    return User;
}
//# sourceMappingURL=user.js.map