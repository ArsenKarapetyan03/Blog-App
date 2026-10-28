import { Sequelize } from "sequelize";
import configJson from "@/config/config.js";
import { User } from "./user.js";
import { Post } from "./post.js";
import { Comment } from "./comment.js";
import { PostLikes } from "./postlikes.js";
import { Image } from "./image.js";
import { Friendship } from "./friendship.js";
const env = (process.env.NODE_ENV || "development");
const config = configJson[env];
export const sequelize = new Sequelize(config.database, config.username, config.password, config);
const models = [User, Post, Comment, PostLikes, Image, Friendship];
models.forEach((model) => model.initialize(sequelize));
models.forEach((model) => model.configureAssociations());
const db = {
    sequelize,
    User,
    Post,
    Comment,
    PostLikes,
    Image,
    Friendship
};
export default db;
//# sourceMappingURL=index.js.map