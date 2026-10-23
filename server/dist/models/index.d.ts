import { Sequelize } from "sequelize";
import { User } from "./user.js";
import { Post } from "./post.js";
import { Comment } from "./comment.js";
import { PostLikes } from "@/models/postlikes.js";
import { Image } from "@/models/image.js";
export declare let sequelize: Sequelize;
declare const db: {
    sequelize: Sequelize;
    Sequelize: typeof Sequelize;
    User: typeof User;
    Post: typeof Post;
    Comment: typeof Comment;
    PostLikes: typeof PostLikes;
    Image: typeof Image;
};
export default db;
//# sourceMappingURL=index.d.ts.map