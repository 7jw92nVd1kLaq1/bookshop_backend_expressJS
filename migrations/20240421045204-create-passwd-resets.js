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
    await queryInterface.createTable('passwd_resets', {
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
      urlCode: {
          field: 'url_code',
          type: Sequelize.DataTypes.STRING(320),
          allowNull: true
      },
      createdAt: {
          field: 'created_at',
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
          defaultValue: Sequelize.DataTypes.NOW,
      },
      expiredAt: {
          field: 'expired_at',
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
      },
      used: {
          type: Sequelize.DataTypes.BOOLEAN,
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
    await queryInterface.dropTable('passwd_resets');
  }
};
