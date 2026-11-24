"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Orders", "subscriptionId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: "Subscriptions",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });

        await queryInterface.addColumn("Orders", "stripeInvoiceId", {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            unique: true,
        });

        await queryInterface.addIndex("Orders", ["subscriptionId"]);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("Orders", ["subscriptionId"]);
        await queryInterface.removeColumn("Orders", "stripeInvoiceId");
        await queryInterface.removeColumn("Orders", "subscriptionId");
    },
};