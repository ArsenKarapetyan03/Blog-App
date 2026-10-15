import {
  Model, DataTypes, type Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type ForeignKey
} from "sequelize";
import type { User } from "./user.js";
import type { Post } from "./post.js";
import type { Comment } from "./comment.js";

export class PostLikes extends Model<
  InferAttributes<PostLikes>,
  InferCreationAttributes<PostLikes>
> {
  declare postId: ForeignKey<Post['id']>;
  declare userId: ForeignKey<User['id']>;

  static associate(models: {
    User: typeof User;
    Post: typeof Post;
    Comment: typeof Comment;
    PostLikes: typeof PostLikes
  }) {
    this.belongsTo(models.Post, { foreignKey: "postId" });
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

export function initPostLikes(sequelize: Sequelize): typeof PostLikes {
  PostLikes.init(
    {
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "PostLikes",
      tableName: "PostLikes",
      timestamps: false,
    }
  );

  return PostLikes;
}
