"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: "userId", as: "User"});
    }
  }
  Post.init({
    title: DataTypes.STRING,
    excerpt: DataTypes.TEXT,
    description: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    author: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.User ? this.User.name : null;
      }
    },
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};