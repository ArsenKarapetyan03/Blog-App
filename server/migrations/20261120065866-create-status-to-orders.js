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
                    allowNull: false,
                    references: {
                        model: "OrderStatuses",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },
                { transaction }
            );

            await queryInterface.addIndex("Orders", ["statusId"], {
                transaction,
            });

            await queryInterface.removeColumn("Orders", "status", {
                transaction,
            });
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn(
                "Orders",
                "status",
                {
                    type: Sequelize.ENUM(
                        "pending",
                        "paid",
                        "failed",
                        "cancelled",
                        "expired",
                        "refunded",
                        "shipped"
                    ),
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