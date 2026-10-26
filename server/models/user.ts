import {
  Model,
  DataTypes,
  type Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  type Association,
} from "sequelize";
import type { Post } from "./post.js";
import type { Comment } from "@/models/comment.js";

export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
    > {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string;

  declare Posts?: NonAttribute<Post[]>;
  declare Comments?: NonAttribute<Comment[]>;
  declare LikedPosts?: NonAttribute<Post[]>;
  declare Friends?: NonAttribute<User[]>;
  declare FriendRequests?: NonAttribute<User[]>;

  declare static associations: {
    Posts: Association<User, Post>;
    Comments: Association<User, Comment>;
    LikedPosts: Association<User, Post>;
    Friends: Association<User, User>;
    FriendRequests: Association<User, User>;
  };

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      },
      { sequelize, modelName: "User" }
    );
  }

  static configureAssociations() {
    const registry = this.sequelize!.models;

    this.hasMany(registry.Post as any, {
      foreignKey: "userId",
      as: "Posts",
    });

    this.hasMany(registry.Comment as any, {
      foreignKey: "userId",
      as: "Comments"
    });

    this.belongsToMany(registry.Post as any, {
      through: "PostLikes",
      foreignKey: "userId",
      otherKey: "postId",
      as: "LikedPosts"
    });

    this.belongsToMany(this, {
      as: "Friends",
      through: {
       model: "Friendship",
        scope: {
          status: "accepted",
        }
      },
      foreignKey: "userId",
      otherKey: "friendId",
    });

    this.belongsToMany(this, {
      as: "FriendRequests",
      through: {
        model: "Friendship",
        scope: {
          status: "pending",
        }
      },
      foreignKey: "friendId",
      otherKey: "userId",
    });
  }
}