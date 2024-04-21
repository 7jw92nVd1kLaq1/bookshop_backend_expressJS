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
    await queryInterface.createTable('books_images', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
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
      path: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false
      },
      description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true
      },
      cover: {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: true
      },
      uploadedAt: {
          field: 'uploaded_at',
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
    await queryInterface.dropTable('books_images');
  }
};
