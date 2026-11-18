"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Orders", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            stripeCheckoutSessionId: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            stripePaymentIntentId: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            status: {
                type: Sequelize.ENUM("pending", "paid", "failed", "refunded"),
                allowNull: false,
                defaultValue: "pending",
            },
            totalAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            currency: {
                type: Sequelize.STRING(3),
                allowNull: false,
                defaultValue: "usd",
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Orders");
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Orders_status";');
    },
};
