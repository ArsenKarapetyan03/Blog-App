import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type Association } from "sequelize";
import type { Post } from "./post.js";
import type { Comment } from "@/models/comment.js";
import type { Message } from "@/models/message.js";
import type { Chat } from "@/models/chat.js";
import type { ChatMember } from "@/models/chatmember.js";
export declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<number>;
    name: string;
    email: string;
    password: string;
    Posts?: NonAttribute<Post[]>;
    Comments?: NonAttribute<Comment[]>;
    SentMessages?: NonAttribute<Message[]>;
    chats?: NonAttribute<Chat[]>;
    memberships?: NonAttribute<ChatMember[]>;
    LikedPosts?: NonAttribute<Post[]>;
    FriendsAsRequester?: NonAttribute<User[]>;
    FriendsAsReceiver?: NonAttribute<User[]>;
    IncomingRequests?: NonAttribute<User[]>;
    OutgoingRequests?: NonAttribute<User[]>;
    static associations: {
        Posts: Association<User, Post>;
        Comments: Association<User, Comment>;
        SentMessages: Association<User, Message>;
        chats: Association<User, Chat>;
        memberships: Association<User, ChatMember>;
        LikedPosts: Association<User, Post>;
        FriendsAsRequester: Association<User, User>;
        FriendsAsReceiver: Association<User, User>;
        IncomingRequests: Association<User, User>;
        OutgoingRequests: Association<User, User>;
    };
    get Friends(): NonAttribute<User[]>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=user.d.ts.map