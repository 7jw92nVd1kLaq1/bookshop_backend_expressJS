'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('statuses', {
      id: {
        type: Sequelize.DataTypes.SMALLINT,
        primaryKey: true
      },
      name: {
          type: Sequelize.DataTypes.STRING(320),
          allowNull: false
      },
      description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('statuses');
  }
};
