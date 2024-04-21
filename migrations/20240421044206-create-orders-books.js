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
    await queryInterface.createTable('orders_books', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      ordersId: {
          field: 'orders_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          references: {
              model: 'orders',
              key: 'id'
          }
      },
      pricesId: {
          field: 'prices_id',
          type: Sequelize.DataTypes.BIGINT,
          allowNull: true,
          references: {
              model: 'prices',
              key: 'id'
          }
      },
      amount: {
          type: Sequelize.DataTypes.INTEGER,
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
    await queryInterface.dropTable('orders_books');
  }
};
