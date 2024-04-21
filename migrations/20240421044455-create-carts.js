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
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      usersId: {
          field: 'users_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true
      },
      name: {
          type: Sequelize.DataTypes.STRING(256),
          allowNull: true
      },
      description: {
          type: Sequelize.DataTypes.TEXT,
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
    await queryInterface.dropTable('carts');
  }
};
