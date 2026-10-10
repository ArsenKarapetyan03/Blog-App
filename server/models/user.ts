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

export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
    > {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string;

  declare Posts?: NonAttribute<Post[]>;

  declare static associations: {
    Posts: Association<User, Post>;
  };

  static associate(models: { Post: typeof Post }) {
    this.hasMany(models.Post, {
      foreignKey: "userId",
      as: "Posts",
    });
  }
}

export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
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
      },
      {
        sequelize,
        modelName: "User",
      }
  );

  return User;
}