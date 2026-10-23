import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type Association } from "sequelize";
import type { Post } from "./post.js";
import type { Comment } from "@/models/comment.js";
import type { PostLikes } from "./postlikes.js";
export declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<number>;
    name: string;
    email: string;
    password: string;
    Posts?: NonAttribute<Post[]>;
    Comments?: NonAttribute<Comment[]>;
    LikedPosts?: NonAttribute<Post[]>;
    static associations: {
        Posts: Association<User, Post>;
        Comments: Association<User, Comment>;
        LikedPosts: Association<User, Post>;
    };
    static associate(models: {
        User: typeof User;
        Post: typeof Post;
        Comment: typeof Comment;
        PostLikes: typeof PostLikes;
    }): void;
}
export declare function initUser(sequelize: Sequelize): typeof User;
//# sourceMappingURL=user.d.ts.map