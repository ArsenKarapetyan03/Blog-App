import { Sequelize } from "sequelize";
import configJson from "@/config/config.js";

import { User } from "@/models/user.js";
import { Post } from "@/models/post.js";
import { Comment } from "@/models/comment.js";
import { PostLikes } from "@/models/postlikes.js";
import { Image } from "@/models/image.js";
import { Friendship } from "@/models/friendship.js";
import { Message } from "@/models/message.js";
import { Chat } from "@/models/chat.js";
import { ChatMember } from "@/models/chatmember.js";
import { Role } from "@/models/role.js";
import { Product } from "@/models/product.js";
import { OrderItem } from "@/models/orderitem.js";
import { Price } from "@/models/price.js";
import { Order } from "@/models/order.js";

const env = (process.env.NODE_ENV || "development") as keyof typeof configJson;
const config = configJson[env] as typeof configJson[typeof env] & {
	database: string;
	username: string;
	password: string;
};

export const sequelize = new Sequelize(config.database, config.username, config.password, config as any);

const models = [
	User,
	Post,
	Comment,
	PostLikes,
	Image,
	Friendship,
	Message,
	Chat,
	ChatMember,
	Role,
	Product,
	Price,
	Order,
	OrderItem,
];

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
	Chat,
	ChatMember,
	Role,
	Product,
	Price,
	Order,
	OrderItem,
};

export default db;
