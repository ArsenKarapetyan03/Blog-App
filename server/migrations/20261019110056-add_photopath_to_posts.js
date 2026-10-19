"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Posts");

    await queryInterface.addColumn("Posts", "images", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    });
  },

  async down (queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Posts");
    if (columns.images) {
      await queryInterface.removeColumn("Posts", "images");
    }
  }
};
