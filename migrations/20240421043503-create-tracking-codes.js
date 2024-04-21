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
    await queryInterface.createTable('tracking_codes', {
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
      shippingCompany: {
          field: 'shipping_company',
          type: Sequelize.DataTypes.STRING(255),
          allowNull: true
      },
      code: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false
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
    await queryInterface.dropTable('tracking_codes');
  }
};
