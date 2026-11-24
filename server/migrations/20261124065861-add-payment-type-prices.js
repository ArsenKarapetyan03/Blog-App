"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn(
                "Prices",
                "type",
                {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    defaultValue: "one_time",
                },
                { transaction }
            );

            await queryInterface.addColumn(
                "Prices",
                "interval",
                {
                    type: Sequelize.STRING(20),
                    allowNull: true,
                },
                { transaction }
            );

            await queryInterface.addColumn(
                "Prices",
                "intervalCount",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                { transaction }
            );

            await queryInterface.addConstraint("Prices", {
                fields: ["type", "interval", "intervalCount"],
                type: "check",
                name: "prices_billing_type_check",
                where: Sequelize.literal(`
                    ("type" = 'one_time' AND "interval" IS NULL AND "intervalCount" IS NULL) OR
                    ("type" = 'recurring' AND "interval" IN ('day', 'week', 'month', 'year') AND "intervalCount" >= 1)
                `),
                transaction,
            });
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.removeConstraint(
                "Prices",
                "prices_billing_type_check",
                { transaction }
            );
            await queryInterface.removeColumn("Prices", "intervalCount", { transaction });
            await queryInterface.removeColumn("Prices", "interval", { transaction });
            await queryInterface.removeColumn("Prices", "type", { transaction });
        });
    },
};