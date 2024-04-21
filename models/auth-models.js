const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Roles = sequelize.define('roles', {
    id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(256),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(320),
        allowNull: true
    },
    weight: {
        type: DataTypes.MEDIUMINT,
        allowNull: true
    },
}, {
    timestamps: false
});

const PasswdResets = sequelize.define('passwd_resets', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true
    },
    urlCode: {
        field: 'url_code',
        type: DataTypes.STRING(320),
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
    expiredAt: {
        field: 'expired_at',
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
}, {
    timestamps: false,
    hooks: {
        beforeCreate: (passwdReset) => {
            passwdReset.expiredAt = new Date();
            passwdReset.expiredAt.setHours(passwdReset.expiredAt.getHours() + 1);
        }
    }
});

module.exports = {
    Roles,
    PasswdResets
};