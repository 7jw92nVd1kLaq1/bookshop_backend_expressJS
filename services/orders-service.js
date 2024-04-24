const { 
    InsertQueryBuilder, 
    SelectQueryBuilder, 
    DeleteQueryBuilder,
    UpdateQueryBuilder,
} = require('../utils/sql-utils');

const {
    BadRequestError,
    InternalServerError,
    NotFoundError
} = require('../exceptions/generic-exceptions');

const {
    getAllBooks
} = require('./books-service');

const {
    Prices
} = require('../models/books-models');
const {
    Addresses,
    Orders,
    OrdersBooks
} = require('../models/orders-models');

const checkAddressValidity = (address) => {
    const validKeys = [
        'recipient', 
        'address1', 
        'address2', 
        'city', 
        'state', 
        'country', 
        'postalCode', 
        'phoneNumber'
    ];

    const addressKeys = Object.keys(address);
    for (let key of addressKeys) {
        if (validKeys.indexOf(key) === -1) {
            delete address[key];
        }
    }

    return address;
};

const getAllOrdersSequelize = async (options = {}) => {
    if (typeof options !== 'object') {
        throw new BadRequestError('Options must be an object.');
    }

    const orders = await Orders.findAll(options);
    return orders;
};

const getAllOrders = async (options = {}, values = [], isMultiValues = false) => {
    const {
        select = ['*'],
        where = [],
        join = [],
        offset = null,
        limit = null,
        orderBy = [],
        groupBy = [],
        having = []
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(select).from('orders');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    join.forEach(j => {
        builder.join(
            j.table, 
            j.on, 
            j.type ? j.type : 'INNER'
        );
    });
    where.forEach(w => builder.where(w));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    groupBy.forEach(g => builder.groupBy(g));
    having.forEach(h => builder.having(h));

    const query = builder.build();
    const orders = await query.run(values, isMultiValues);

    if (orders.length === 0) {
        return [];
    }

    return orders;
};

const getOrderById = async (id, usersId, options = {}) => {
    const {
        select = ['*'],
        join = [],
        offset = null,
        limit = null,
        orderBy = [],
        groupBy = [],
        having = []
    } = options;

    if (id == null) {
        throw new BadRequestError('Order ID is required');
    }
    if (usersId == null) {
        throw new BadRequestError('User ID is required');
    }

    const builder = new SelectQueryBuilder();
    builder
        .select(select)
        .from('orders')
        .where('orders.id = ? AND orders.users_id = ?');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    join.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    groupBy.forEach(g => builder.groupBy(g));
    having.forEach(h => builder.having(h));

    const query = builder.build();
    const orders = await query.run([id, usersId]);

    if (orders.length === 0) {
        return null;
    }

    return orders;
};

const getOrderAddress = async (addressesId, options = {}) => {
    const {
        select = ['*'],
        join = [],
    } = options;

    if (addressesId == null) {
        throw new BadRequestError('Address ID is required');
    }

    const builder = new SelectQueryBuilder();
    builder
        .select(select)
        .from('addresses')
        .where('id = ?');
    join.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

    const query = builder.build();
    const addresses = await query.run([addressesId]);

    if (addresses.length < 1) {
        return null;
    }

    return addresses[0];
};

const createAddress = async (
    transaction,
    usersId,
    address
) => {
    if (usersId == null) {
        throw new BadRequestError('User ID is required');
    }
    const validKeys = [
        'recipient', 
        'address1', 
        'address2', 
        'city', 
        'state', 
        'country', 
        'postalCode', 
        'phoneNumber'
    ];

    for (let key of validKeys) {
        if (address[key] == null) {
            throw new BadRequestError(`Address '${key}' is required`);
        }
    }

    const newAddress = await Addresses.create({
        ...address,
        userId: usersId
    }, { transaction });

    if (newAddress === null) {
        throw new InternalServerError('Address was not created. Please try again.');
    }

    return newAddress.id;
};

const createOrderItems = async (
    transaction,
    ordersId,
    items
) => {
    if (ordersId == null) {
        throw new BadRequestError('Order ID is required');
    }
    if (items == null || items.length === 0) {
        throw new BadRequestError('Items are required');
    }

    const booksIds = items.map(item => item.booksId);
    // Get the latest price for each book
    const latestPriceQueryOptions = {
        columns: [
            'id',
            '(SELECT id FROM prices WHERE books_id = books.id ORDER BY created_at DESC LIMIT 1) AS prices_id'
        ],
        wheres: ['id IN (?)']
    };
    const latestPrices = await getAllBooks(latestPriceQueryOptions, [booksIds]);
    if (latestPrices.length != booksIds.length) {
        throw new InternalServerError('Some books you have requested do not have prices. Please contact the administrator.');
    }

    // Check if the items have the required fields
    const validKeys = ['ordersId', 'pricesId', 'amount'];
    for (let i=0; i<items.length; i++) {
        const price = latestPrices.find(p => p.id === items[i].booksId);
        items[i] = { ...items[i], ordersId: ordersId, pricesId: price.prices_id};

        delete items[i].booksId;
        validKeys.forEach(key => {
            if (items[i][key] == null) {
                throw new BadRequestError(`Field '${key}' is required`);
            }
        });
    };

    const orderBooks = await OrdersBooks.bulkCreate(items, { transaction });
    if (orderBooks === null) {
        throw new InternalServerError('Order items were not created. Please try again.');
    }
    return orderBooks;
};

const createOrder = async (
    transaction,
    usersId,
    items,
    address,
) => {
    const addressId = await createAddress(transaction, usersId, address);
    if (addressId === null) {
        throw new InternalServerError('Address was not created. Please try again.');
    }

    const order = await Orders.create({
        usersId: usersId,
        addressesId: addressId,
        statusesId: 200
    }, { transaction });
    if (order === null) {
        throw new InternalServerError('Order was not created. Please try again.');
    }

    await createOrderItems(transaction, order.id, items);
    return order.id;
};

const updateOrderStatus = async (
    connection,
    orders_id,
    statuses_id
) => {
    if (orders_id == null || statuses_id == null) {
        throw new BadRequestError('Order ID and Status ID are required');
    }

    const builder = new UpdateQueryBuilder();
    builder
        .update('orders')
        .set('statuses_id = ?')
        .where('id = ?');

    const query = builder.build();
    const result = await query.run(connection, [statuses_id, orders_id]);

    if (result.affectedRows === 0) {
        throw new InternalServerError('Order status was not updated. Please try again.');
    }

    return true;
};

const updateAddress = async (
    connection,
    users_id,
    orders_id,
    address
) => {
    if (orders_id == null) {
        throw new BadRequestError('Order ID and Address ID are required');
    }
    if (address == null) {
        throw new BadRequestError('Address is required');
    }
    const filteredAddress = checkAddressValidity(address);
    if (Object.keys(filteredAddress).length === 0) {
        throw new BadRequestError('Address is required');
    }

    // Check if an order has the address
    const addressQueryBuilder = new SelectQueryBuilder();
    builder
        .select(['id AS orders_id', 'addresses.id AS addresses_id', 'users_id'])
        .from('orders')
        .where('id = ?')
        .join('addresses', 'orders.addresses_id = addresses.id', 'INNER');
    
    const addressQuery = addressQueryBuilder.build();
    const addressResult = await addressQuery.run(connection, [orders_id]);

    if (addressResult.length === 0) {
        throw new InternalServerError('Order address was not found. Please try again.');
    }
    if (addressResult[0].users_id !== users_id) {
        throw new BadRequestError('You are not authorized to update this order address');
    }
    if (addressResult[0].addresses_id === null) {
        throw new NotFoundError('Order address is not available');
    }

    const validKeys = filteredAddress.keys();
    const values = validKeys.map(key => filteredAddress[key]);
    values.push(addressResult[0].addresses_id);

    const builder = new UpdateQueryBuilder();
    builder
        .update('addresses')
        .where('id = ?');

    validKeys.forEach((key, index) => {
        builder.set(key, '?');
    });
    
    const query = builder.build();
    const result = await query.run(connection, values);

    if (result.affectedRows === 0) {
        throw new InternalServerError('Order address was not updated. Please try again.');
    }

    return true;
};

module.exports = {
    getAllOrders,
    getAllOrdersSequelize,
    getOrderById,
    getOrderAddress,
    createOrder
};