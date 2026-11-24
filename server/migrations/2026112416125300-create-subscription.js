"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Subscriptions", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            priceId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Prices",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            stripeSubscriptionId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            status: {
                type: Sequelize.STRING(30),
                allowNull: false,
                defaultValue: "incomplete",
            },
            currentPeriodStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            currentPeriodEnd: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            cancelAtPeriodEnd: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            canceledAt: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex("Subscriptions", ["userId"]);
        await queryInterface.addIndex("Subscriptions", ["status"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("Subscriptions");
    },
};