import {
  Model, DataTypes, type Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type ForeignKey
} from "sequelize";
import type { User } from "./user.js";
import type { Post } from "./post.js";

export class PostLikes extends Model<
  InferAttributes<PostLikes>,
  InferCreationAttributes<PostLikes>
> {
  declare postId: ForeignKey<Post['id']>;
  declare userId: ForeignKey<User['id']>;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
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
      },
      {
        sequelize,
        modelName: "PostLikes",
        tableName: "PostLikes",
        timestamps: false,
      }
    );
  }

  static configureAssociations() {
    const registry = this.sequelize!.models;

    this.belongsTo(registry.Post as any, { foreignKey: "postId" });
    this.belongsTo(registry.User as any, { foreignKey: "userId" });
  }
}
