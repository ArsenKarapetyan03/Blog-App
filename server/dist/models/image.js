"use strict";
import { Model, DataTypes } from "sequelize";
import {} from "@/models/post.js";
export class Image extends Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Posts",
                    key: "id",
                },
                onDelete: "CASCADE"
            },
            imagePath: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: "Image"
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.Post, {
            foreignKey: "postId",
            as: "post"
        });
    }
}
//# sourceMappingURL=image.js.map