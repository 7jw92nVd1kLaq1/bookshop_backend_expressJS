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
    await queryInterface.createTable('users_roles', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      usersId: {
        field: 'users_id',
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: 'unique_user_role_id'
      },
      rolesId: {
        field: 'roles_id',
        type: Sequelize.SMALLINT,
        allowNull: false,
        unique: 'unique_user_role_id'
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
    await queryInterface.dropTable('users_roles');
  }
};
