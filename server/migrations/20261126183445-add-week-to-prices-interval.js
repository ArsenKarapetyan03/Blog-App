"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
    async up(queryInterface, Sequelize) {
        const [results] = await queryInterface.sequelize.query(`
			SELECT udt_name, data_type
			FROM information_schema.columns
			WHERE table_name = 'Prices' AND column_name = 'interval';
		`);

        const column = results[0];

        if (column && column.data_type === "USER-DEFINED") {
            await queryInterface.sequelize.query(
                `ALTER TYPE "${column.udt_name}" ADD VALUE IF NOT EXISTS 'week';`
            );
        }
    },

    async down(queryInterface, Sequelize) {
    },
};
