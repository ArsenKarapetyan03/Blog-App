import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey, type Association, type NonAttribute } from "sequelize";
import type { Post } from "./post.js";
import type { User } from "./user.js";
export declare class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
    id: CreationOptional<number>;
    content: string;
    postId: ForeignKey<Post["id"]>;
    userId: ForeignKey<User["id"]>;
    replyId: CreationOptional<ForeignKey<Comment["id"]> | null>;
    User?: NonAttribute<User | null>;
    Post?: NonAttribute<Post | null>;
    ParentComment?: NonAttribute<Comment | null>;
    Replies?: NonAttribute<Comment[]>;
    static associations: {
        Post: Association<Comment, Post>;
        User: Association<Comment, User>;
        ParentComment: Association<Comment, Comment>;
        Replies: Association<Comment, Comment>;
    };
    static configureAssociations(): void;
    static initialize(sequelize: Sequelize): void;
}
//# sourceMappingURL=comment.d.ts.map