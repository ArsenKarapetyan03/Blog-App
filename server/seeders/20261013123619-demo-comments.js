'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("Comments", [{
            id: 1,
            content: "Good job",
            userId: 2,
            postId: 1,
            replyId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }], {});

        await queryInterface.bulkInsert("Comments", [{
            id: 2,
            content: "Thank you",
            userId: 1,
            postId: 1,
            replyId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        }], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Comments", null, {});
    }
};
