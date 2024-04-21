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
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
          type: Sequelize.DataTypes.STRING(320),
          allowNull: false
      },
      description: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true
      },
      categoriesId: {
          field: 'categories_id',
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
          references: {
              model: 'categories',
              key: 'id'
          }
      },
      authorsId: {
          field: 'authors_id',
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
          references: {
              model: 'authors',
              key: 'id'
          }
      },
      pageNumber: {
          field: 'page_number',
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true
      },
      ISBN: {
          field: 'isbn',
          type: Sequelize.DataTypes.STRING(128),
          allowNull: true
      },
      pubDate: {
          field: 'pub_date',
          type: Sequelize.DataTypes.DATE,
          allowNull: true
      },
      publishers: {
          type: Sequelize.DataTypes.STRING(256),
          allowNull: true
      },
      form: {
          type: Sequelize.DataTypes.STRING(64),
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
    await queryInterface.dropTable('books');
  }
};
