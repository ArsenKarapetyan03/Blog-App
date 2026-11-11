"use strict";
/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Messages", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            chatId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Chats", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            senderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            messageText: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            isDeleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
        await queryInterface.addIndex("Messages", ["chatId", "createdAt"]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Messages");
    },
};
//# sourceMappingURL=20261106000003-create-message.js.map