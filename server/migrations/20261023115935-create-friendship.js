"use strict"

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Friendships", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "blocked"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex("Friendships", ["requesterId", "receiverId"], {
      unique: true,
      name: "unique_requester_receiver_pair",
    });

    await queryInterface.addConstraint("Friendships", {
      type: "check",
      fields: ["requesterId", "receiverId"],
      where: {
        requesterId: { [Sequelize.Op.ne]: Sequelize.col("receiverId") }
      },
      name: "check_self_friendship"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Friendships", "check_self_friendship");
    await queryInterface.removeIndex("Friendships", "unique_requester_receiver_pair");
    await queryInterface.dropTable("Friendships");
  }
};