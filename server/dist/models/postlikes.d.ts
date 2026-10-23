import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type ForeignKey } from "sequelize";
import type { User } from "./user.js";
import type { Post } from "./post.js";
import type { Comment } from "./comment.js";
export declare class PostLikes extends Model<InferAttributes<PostLikes>, InferCreationAttributes<PostLikes>> {
    postId: ForeignKey<Post['id']>;
    userId: ForeignKey<User['id']>;
    static associate(models: {
        User: typeof User;
        Post: typeof Post;
        Comment: typeof Comment;
        PostLikes: typeof PostLikes;
    }): void;
}
export declare function initPostLikes(sequelize: Sequelize): typeof PostLikes;
//# sourceMappingURL=postlikes.d.ts.map