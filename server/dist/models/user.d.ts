import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type Association } from "sequelize";
import type { Post } from "./post.js";
import type { Comment } from "@/models/comment.js";
export declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<number>;
    name: string;
    email: string;
    password: string;
    Posts?: NonAttribute<Post[]>;
    Comments?: NonAttribute<Comment[]>;
    LikedPosts?: NonAttribute<Post[]>;
    InitiatedFriends?: NonAttribute<User[]>;
    ReceivedFriends?: NonAttribute<User[]>;
    IncomingRequests?: NonAttribute<User[]>;
    OutgoingRequests?: NonAttribute<User[]>;
    static associations: {
        Posts: Association<User, Post>;
        Comments: Association<User, Comment>;
        LikedPosts: Association<User, Post>;
        InitiatedFriends: Association<User, User>;
        ReceivedFriends: Association<User, User>;
        IncomingRequests: Association<User, User>;
        OutgoingRequests: Association<User, User>;
    };
    get Friends(): NonAttribute<User[]>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=user.d.ts.map