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
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
          type: Sequelize.DataTypes.STRING(256),
          allowNull: false,
          unique: true
      },
      description: {
          type: Sequelize.DataTypes.STRING(320),
          allowNull: true
      },
      weight: {
          type: Sequelize.DataTypes.MEDIUMINT,
          allowNull: true
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('roles');
  }
};
