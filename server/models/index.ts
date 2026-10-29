import { Sequelize } from "sequelize";
import configJson from "@/config/config.js";

import { User } from "./user.js";
import { Post } from "./post.js";
import { Comment } from "./comment.js";
import { PostLikes } from "./postlikes.js";
import { Image } from "./image.js";
import { Friendship } from "./friendship.js";
import { Message } from "./message.js";

const env = (process.env.NODE_ENV || "development") as keyof typeof configJson;
const config = configJson[env] as typeof configJson[typeof env] & {
	database: string;
	username: string;
	password: string;
};

export const sequelize = new Sequelize(config.database, config.username, config.password, config as any);

const models = [User, Post, Comment, PostLikes, Image, Friendship, Message];

models.forEach((model) => model.initialize(sequelize));

models.forEach((model) => model.configureAssociations());

const db = {
	sequelize,
	User,
	Post,
	Comment,
	PostLikes,
	Image,
	Friendship,
	Message,
};

export default db;
