'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert("Comments", [{
       content: "Interesting",
       userId: 1,
       postId: 1,
       createdAt: new Date(),
       updatedAt: new Date(),
     }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Comments", null, {});
  }
};
