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
    await queryInterface.createTable('profile_images', {
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
      path: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false
      },
      updatedAt: {
          field: 'updated_at',
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.DataTypes.NOW,
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
    await queryInterface.dropTable('profile_images');
  }
};
