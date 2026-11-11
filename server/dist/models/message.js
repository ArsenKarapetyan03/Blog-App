import { DataTypes, Model, } from "sequelize";
export class Message extends Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            chatId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            messageText: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: "Message"
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.User, {
            foreignKey: "senderId",
            as: "sender",
        });
        this.belongsTo(registry.Chat, {
            foreignKey: "chatId",
            as: "chat",
        });
    }
}
//# sourceMappingURL=message.js.map