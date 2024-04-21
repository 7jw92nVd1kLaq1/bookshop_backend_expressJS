const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Authors = sequelize.define('authors', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
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
    timestamps: false
});


const AuthorsLikes = sequelize.define('authors_likes', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: 'uniq_users_authors_likes_key',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    authorsId: {
        field: 'authors_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: 'uniq_users_authors_likes_key',
        references: {
            model: 'authors',
            key: 'id'
        }
    }
}, {
    timestamps: false
});


module.exports = {
    Authors,
    AuthorsLikes
};