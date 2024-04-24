const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Addresses = sequelize.define('addresses', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    recipient: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    phoneNumber: {
        field: 'phone_number',
        type: DataTypes.STRING(320),
        allowNull: false
    },
    address1: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    address2: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    country: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isValidCountryCode(value) {
                const regionNamesInEnglish = new Intl.DisplayNames(
                    ['en'], 
                    { type: 'region', fallback: "none"}
                );
                const regionNames = regionNamesInEnglish.of(value);
                if (regionNames === undefined) {
                    throw new Error('Invalid country code');
                }
            }   
        }
    },
    postalCode: {
        field: 'postal_code',
        type: DataTypes.STRING(320),
        allowNull: false
    },
    userId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    name: {
        singular: 'address',
        plural: 'addresses'
    },
    timestamps: false
});

const Orders = sequelize.define('orders', {
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
    addressesId: {
        field: 'addresses_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'addresses',
            key: 'id'
        }
    },
    statusesId: {
        field: 'statuses_id',
        type: DataTypes.SMALLINT,
        allowNull: true,
        references: {
            model: 'statuses',
            key: 'id'
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
    name: {
        singular: 'order',
        plural: 'orders'
    },
    timestamps: false,
    hooks: {
        beforeUpdate: (order) => {
            order.updatedAt = new Date();
        }
    }
});

const OrdersBooks = sequelize.define('orders_books', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    ordersId: {
        field: 'orders_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    pricesId: {
        field: 'prices_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'prices',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    name: {
        singular: 'ordersBook',
        plural: 'ordersBooks'
    },
    timestamps: false
});

const Statuses = sequelize.define('statuses', {
    id: {
        type: DataTypes.SMALLINT,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(320),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: false
});

const TrackingCodes = sequelize.define('tracking_codes', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    ordersId: {
        field: 'orders_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    shippingCompany: {
        field: 'shipping_company',
        type: DataTypes.STRING(255),
        allowNull: true
    },
    code: {
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
    name: {
        singular: 'trackingCode',
        plural: 'trackingCodes'
    }, 
    timestamps: false,
    hooks: {
        beforeUpdate: (trackingCode) => {
            trackingCode.updatedAt = new Date();
        }
    }
});

module.exports = {
    Addresses,
    Orders,
    OrdersBooks,
    Statuses,
    TrackingCodes
};