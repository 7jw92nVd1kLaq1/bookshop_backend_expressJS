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
    await queryInterface.createTable('carts_items', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      cartsId: {
          field: 'carts_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          unique: 'unique_carts_books_index'
      },
      booksId: {
          field: 'books_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          unique: 'unique_carts_books_index'
      },
      amount: {
          type: Sequelize.DataTypes.INTEGER,
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
    await queryInterface.dropTable('carts_items');
  }
};
