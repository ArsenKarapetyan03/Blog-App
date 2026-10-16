import { Sequelize } from "sequelize";
import configJson from "@/config/config.js";
import { User, initUser } from "./user.js";
import { Post, initPost } from "./post.js";
import { Comment, initComment } from "./comment.js";
import { PostLikes, initPostLikes } from "@/models/postlikes.js";

type Environment = keyof typeof configJson;

const env = (process.env.NODE_ENV || "development") as Environment;
const config = configJson[env];

if (!config) {
    throw new Error(`Database configuration not found for "${env}"`);
}

export let sequelize: Sequelize;

if ("use_env_variable" in config && config.use_env_variable) {
    const connectionString = process.env[config.use_env_variable as string];

    if (!connectionString) {
        throw new Error(
            `Environment variable "${config.use_env_variable}" is not defined`
        );
    }

    sequelize = new Sequelize(connectionString, config as any);
} else {
    const c = config as any;
    sequelize = new Sequelize(
        c.database,
        c.username,
        c.password,
        c
    );
}

initUser(sequelize);
initPost(sequelize);
initComment(sequelize);
initPostLikes(sequelize);

const models = {User, Post, Comment, PostLikes};

User.associate(models);
Post.associate(models);
Comment.associate(models);
PostLikes.associate(models);

const db = {
    sequelize,
    Sequelize,
    User,
    Post,
    Comment,
    PostLikes,
};

export default db;