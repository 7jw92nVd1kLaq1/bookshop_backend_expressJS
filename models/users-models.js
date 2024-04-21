const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Users = sequelize.define('users', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(320),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(320),
        allowNull: true,
        validate: {
            isValidHash(value) {
                // check if the value is a valid bcrypt hash
                const isValidHash = /^\$2[ayb]\$.{56}$/.test(value);
                if (!isValidHash) {
                    throw new Error('Password is not a valid bcrypt hash');
                }
            }
        }
    },
    nickname: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
            isValid(value) {
                const nicknameLength = value && value.length <= 150;
                const hasUnallowedCharacters = /[^A-Za-z0-9\s_-]/.test(value);
            
                if (!nicknameLength || hasUnallowedCharacters) {
                    throw new Error('Nickname contains unallowed characters');
                }
            }
        }
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
        beforeUpdate: (user) => {
            user.updatedAt = new Date();
        }
    },
    scopes: {
        byId(id) {
            return {
                attributes: {
                    exclude: ['password']
                },
                where: {
                    id
                },
            }
        },
        byEmail(email) {
            return {
                where: {
                    email
                }
            }
        },
    }
});

const UsersRoles = sequelize.define('users_roles', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: 'unique_user_role_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rolesId: {
        field: 'roles_id',
        type: DataTypes.SMALLINT,
        allowNull: false,
        unique: 'unique_user_role_id',
        references: {
            model: 'roles',
            key: 'id'
        }
    }
}, {
    timestamps: false
});

const ProfileImages = sequelize.define('profile_images', {
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
    path: {
        type: DataTypes.TEXT,
        allowNull: true
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

module.exports = {
    Users,
    UsersRoles,
    ProfileImages
};