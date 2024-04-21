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
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      recipient: {
        type: Sequelize.DataTypes.STRING(320),
        allowNull: false
      },
      phoneNumber: {
        field: 'phone_number',
        type: Sequelize.DataTypes.STRING(320),
        allowNull: false
      },
      address1: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      address2: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.DataTypes.STRING(320),
        allowNull: false
      },
      state: {
        type: Sequelize.DataTypes.STRING(320),
        allowNull: false
      },
      country: {
        type: Sequelize.DataTypes.STRING(10),
        allowNull: false,
      },
      postalCode: {
        field: 'postal_code',
        type: Sequelize.DataTypes.STRING(320),
        allowNull: false
      },
      userId: {
        field: 'users_id',
        type: Sequelize.DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
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
    await queryInterface.dropTable('addresses');
  }
};