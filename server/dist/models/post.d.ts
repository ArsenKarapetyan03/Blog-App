import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type Association, type ForeignKey } from "sequelize";
import type { User } from "./user.js";
import type { Comment } from "./comment.js";
import type { PostLikes } from "@/models/postlikes.js";
import type { Image } from "@/models/image.js";
export declare class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
    id: CreationOptional<number>;
    title: string | null;
    excerpt: string | null;
    description: string | null;
    userId: ForeignKey<User['id'] | null>;
    User?: NonAttribute<User | null>;
    Comments?: NonAttribute<Comment[]>;
    LikedByUsers?: NonAttribute<User[]>;
    Images?: NonAttribute<Image[]>;
    static associations: {
        User: Association<Post, User>;
        Comments: Association<Post, Comment>;
        LikedByUsers: Association<Post, User>;
        Images: Association<Post, Image>;
    };
    static associate(models: {
        User: typeof User;
        Post: typeof Post;
        Comment: typeof Comment;
        PostLikes: typeof PostLikes;
        Image: typeof Image;
    }): void;
}
export declare function initPost(sequelize: Sequelize): typeof Post;
//# sourceMappingURL=post.d.ts.map