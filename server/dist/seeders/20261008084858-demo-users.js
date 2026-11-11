"use strict";
/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("Users", [{
                name: "Michael Jordan",
                email: "jordan@email.com",
                password: "jordan1234",
                createdAt: new Date(),
                updatedAt: new Date(),
            }], {});
        await queryInterface.bulkInsert("Users", [{
                name: "Jenifer",
                email: "jenifer@email.com",
                password: "jenifer1234",
                createdAt: new Date(),
                updatedAt: new Date(),
            }], {});
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Users", null, {});
    }
};
//# sourceMappingURL=20261008084858-demo-users.js.map