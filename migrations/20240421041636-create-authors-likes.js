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
    await queryInterface.createTable('authors_likes', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      usersId: {
          field: 'users_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          unique: 'uniq_users_authors_likes_key',
          references: {
              model: 'users',
              key: 'id'
          }
      },
      authorsId: {
          field: 'authors_id',
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
          unique: 'uniq_users_authors_likes_key',
          references: {
              model: 'authors',
              key: 'id'
          }
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
    await queryInterface.dropTable('authors_likes');
  }
};
