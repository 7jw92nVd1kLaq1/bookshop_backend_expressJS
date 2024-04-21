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
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      usersId: {
          field: 'users_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          references: {
              model: 'users',
              key: 'id'
          }
      },
      booksId: {
          field: 'books_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          references: {
              model: 'books',
              key: 'id'
          }
      },
      title: {
          type: Sequelize.DataTypes.STRING(320),
          allowNull: true
      },
      description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true
      },
      rating: {
          type: Sequelize.DataTypes.DECIMAL(2, 1),
          allowNull: true
      },
      createdAt: {
          field: 'created_at',
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.DataTypes.NOW,
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
  }
};
