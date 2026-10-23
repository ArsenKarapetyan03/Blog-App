import { Sequelize } from "sequelize";
import configJson from "@/config/config.js";
import { User, initUser } from "./user.js";
import { Post, initPost } from "./post.js";
import { Comment, initComment } from "./comment.js";
import { PostLikes, initPostLikes } from "@/models/postlikes.js";
import { Image, initImage } from "@/models/image.js";
const env = (process.env.NODE_ENV || "development");
const config = configJson[env];
if (!config) {
    throw new Error(`Database configuration not found for "${env}"`);
}
export let sequelize;
if ("use_env_variable" in config && config.use_env_variable) {
    const connectionString = process.env[config.use_env_variable];
    if (!connectionString) {
        throw new Error(`Environment variable "${config.use_env_variable}" is not defined`);
    }
    sequelize = new Sequelize(connectionString, config);
}
else {
    const c = config;
    sequelize = new Sequelize(c.database, c.username, c.password, c);
}
initUser(sequelize);
initPost(sequelize);
initComment(sequelize);
initPostLikes(sequelize);
initImage(sequelize);
const models = { User, Post, Comment, PostLikes, Image };
User.associate(models);
Post.associate(models);
Comment.associate(models);
PostLikes.associate(models);
Image.associate(models);
const db = {
    sequelize,
    Sequelize,
    User,
    Post,
    Comment,
    PostLikes,
    Image,
};
export default db;
//# sourceMappingURL=index.js.map