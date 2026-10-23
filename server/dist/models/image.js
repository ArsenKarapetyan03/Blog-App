"use strict";
import { Model, DataTypes } from "sequelize";
import {} from "@/models/post.js";
export class Image extends Model {
    static associate(models) {
        this.belongsTo(models.Post, {
            foreignKey: "postId",
            as: "post"
        });
    }
}
export function initImage(sequelize) {
    Image.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Post",
                key: "id",
            }
        },
        imagePath: DataTypes.STRING
    }, {
        sequelize,
        modelName: "Image"
    });
    return Image;
}
//# sourceMappingURL=image.js.map