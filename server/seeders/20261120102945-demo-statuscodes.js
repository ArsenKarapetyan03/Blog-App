"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface) {
        const now = new Date();
        await queryInterface.bulkInsert(
            "OrderStatuses",
            [
                {
                    code: "pending",
                    label: "Pending",
                    description: "Order created and awaiting payment.",
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    code: "paid",
                    label: "Paid",
                    description: "Payment completed successfully.",
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    code: "failed",
                    label: "Failed",
                    description: "Payment attempt failed.",
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    code: "cancelled",
                    label: "Cancelled",
                    description: "Order was cancelled.",
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    code: "expired",
                    label: "Expired",
                    description: "Checkout session expired before payment.",
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    code: "refunded",
                    label: "Refunded",
                    description: "Payment was refunded to the customer.",
                    createdAt: now,
                    updatedAt: now,
                },
            ],
            { ignoreDuplicates: true }
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("OrderStatuses", {
            code: ["pending", "paid", "failed", "cancelled", "expired", "refunded"],
        });
    },
};