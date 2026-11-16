"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ChatMembers", {
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Roles", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      lastReadAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
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

    await queryInterface.addIndex("ChatMembers", ["chatId", "userId"], {
      unique: true,
      name: "chat_member_unique_idx"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ChatMembers");
  },
};
