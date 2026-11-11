import { Sequelize } from "sequelize";
import { User } from "./user.js";
import { Post } from "./post.js";
import { Comment } from "./comment.js";
import { PostLikes } from "./postlikes.js";
import { Image } from "./image.js";
import { Friendship } from "./friendship.js";
import { Message } from "./message.js";
import { Chat } from "./chat.js";
import { ChatMember } from "./chatmember.js";
export declare const sequelize: Sequelize;
declare const db: {
    sequelize: Sequelize;
    User: typeof User;
    Post: typeof Post;
    Comment: typeof Comment;
    PostLikes: typeof PostLikes;
    Image: typeof Image;
    Friendship: typeof Friendship;
    Message: typeof Message;
    Chat: typeof Chat;
    ChatMember: typeof ChatMember;
};
export default db;
//# sourceMappingURL=index.d.ts.map