const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Carts = sequelize.define('carts', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(256),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {
    timestamps: false
});

const CartsItems = sequelize.define('carts_items', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    cartsId: {
        field: 'carts_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: 'unique_carts_item_index',
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    booksId: {
        field: 'books_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: 'unique_carts_item_index',
        references: {
            model: 'books',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    }
}, {
    timestamps: false,
    hooks: {
        beforeUpdate: (cartItem) => {
            cartItem.updatedAt = new Date();
        }
    }
});


module.exports = {
    Carts,
    CartsItems
};