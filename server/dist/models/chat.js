import { DataTypes, Model, } from "sequelize";
export class Chat extends Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isGroup: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
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
            modelName: "Chat",
        });
    }
    static configureAssociations() {
        const registry = this.sequelize.models;
        this.hasMany(registry.Message, {
            foreignKey: "chatId",
            as: "messages",
        });
        this.hasMany(registry.ChatMember, {
            foreignKey: "chatId",
            as: "memberships",
        });
        this.belongsToMany(registry.User, {
            through: registry.ChatMember,
            foreignKey: "chatId",
            otherKey: "userId",
            as: "users",
        });
    }
}
//# sourceMappingURL=chat.js.map