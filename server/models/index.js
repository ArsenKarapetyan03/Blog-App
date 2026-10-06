import { Sequelize } from "sequelize";
import configJson from "../config/config.js";

const env = process.env.NODE_ENV || "development";
const config = configJson[env];

const sequelize = config.url
    ? new Sequelize(config.url, config)
    : new Sequelize(config.database, config.username, config.password, config);

export { sequelize, Sequelize };
export default sequelize;
