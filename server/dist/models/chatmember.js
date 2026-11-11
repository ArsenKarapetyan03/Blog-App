import { DataTypes, Model, } from "sequelize";
export class ChatMember extends Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            chatId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            role: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "member",
            },
            lastReadAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
        }, {
            sequelize,
            modelName: "ChatMember",
            indexes: [
                {
                    unique: true,
                    fields: ["chatId", "userId"],
                },
            ],
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.belongsTo(registry.Chat, {
            foreignKey: "chatId",
            as: "chat",
        });
        this.belongsTo(registry.User, {
            foreignKey: "userId",
            as: "user",
        });
    }
}
//# sourceMappingURL=chatmember.js.map