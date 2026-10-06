import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Post = sequelize.define("Post", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    author: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: "posts",
    timestamps: false,
});

export default Post;
