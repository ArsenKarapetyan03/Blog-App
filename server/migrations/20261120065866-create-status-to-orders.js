"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.createTable(
                "OrderStatuses",
                {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER,
                    },
                    code: {
                        type: Sequelize.STRING(32),
                        allowNull: false,
                        unique: true,
                    },
                    label: {
                        type: Sequelize.STRING(64),
                        allowNull: false,
                    },
                    description: {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    createdAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                    updatedAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                },
                { transaction }
            );

            await queryInterface.addColumn(
                "Orders",
                "statusId",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "OrderStatuses",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },
                { transaction }
            );

            await queryInterface.removeColumn("Orders", "status", { transaction });
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_Orders_status";',
                { transaction }
            );
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn(
                "Orders",
                "status",
                {
                    type: Sequelize.ENUM("pending", "paid", "failed", "refunded"),
                    allowNull: false,
                    defaultValue: "pending",
                },
                { transaction }
            );

            await queryInterface.removeColumn("Orders", "statusId", {
                transaction,
            });
            await queryInterface.dropTable("OrderStatuses", { transaction });
        });
    },
};