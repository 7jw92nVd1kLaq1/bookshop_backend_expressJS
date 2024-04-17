const { 
    InsertQueryBuilder, 
    SelectQueryBuilder, 
    DeleteQueryBuilder,
    UpdateQueryBuilder,
} = require('../utils/sql-utils');

const {
    BadRequestError,
    InternalServerError
} = require('../exceptions/generic-exceptions');

const {
    getAllBooks
} = require('./books-service');


const getAllOrders = async (options = {}, values = []) => {
    const {
        select = ['*'],
        where = [],
        joins = [],
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
    joins.forEach(j => {
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
    const orders = await query.run(values);

    if (orders.length === 0) {
        return [];
    }

    return orders;
};

const getOrderById = async (id, usersId, options = {}) => {
    const {
        select = ['*'],
        joins = [],
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
    joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));
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

const createAddress = async (
    connection,
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
        'postal_code', 
        'phone_number'
    ];

    for (let key of validKeys) {
        if (address[key] == null) {
            throw new BadRequestError(`Address '${key}' is required`);
        }
    }

    validKeys.push('users_id');

    const values = [
        address.recipient,
        address.address1,
        address.address2,
        address.city,
        address.state,
        address.country,
        address.postal_code,
        address.phone_number,
        usersId
    ];

    const builder = new InsertQueryBuilder();
    builder
        .insert(validKeys)  
        .into('addresses')
        .values([['?', '?', '?', '?', '?', '?', '?', '?', '?']]);

    const query = builder.build();

    const result = await query.run(connection, values);
    if (result.affectedRows === 0) {
        throw new InternalServerError('Address was not created. Please try again.');
    }
    return result.insertId;
};

const createOrderItems = async (
    connection,
    ordersId,
    items
) => {
    if (ordersId == null) {
        throw new BadRequestError('Order ID is required');
    }
    if (items == null || items.length === 0) {
        throw new BadRequestError('Items are required');
    }

    const booksIds = items.map(item => item.books_id);
    const latestPriceQueryOptions = {
        columns: [
            'id',
            '(SELECT id FROM prices WHERE books_id = books.id ORDER BY created_at DESC LIMIT 1) AS prices_id'
        ],
        wheres: ['id IN (?)'],
        orderBy: [{ column: 'created_at', order: 'DESC' }],
    };
    const latestPrices = await getAllBooks(latestPriceQueryOptions, [booksIds]);

    const validKeys = ['orders_id', 'prices_id', 'amount'];
    const values = items.map(item => {
        const price = latestPrices.find(p => p.id === item.books_id);
        return [ordersId, price.prices_id, item.amount];
    });
    const isEmpty = values.some(v => v.some(i => i == null));
    if (isEmpty) {
        throw new BadRequestError('Some fields are missing in the items. Please check again.');
    }

    // [[1, 2, 3], [4, 5, 6], [7, 8, 9]] => [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const oneDimensionalValues = values.flat(); 

    const placeholders = items.map(() => ['?', '?', '?']);
    const builder = new InsertQueryBuilder();
    builder
        .insert(validKeys)
        .into('orders_books')
        .values(placeholders);

    const query = builder.build();

    const result = await query.run(connection, oneDimensionalValues);
    if (result.affectedRows !== items.length) {
        throw new InternalServerError('Order items were not created. Please try again.');
    }
    return result.affectedRows;
};

const createOrder = async (
    connection,
    usersId,
    items,
    address,
) => {
    const addressId = await createAddress(connection, usersId, address);
    if (addressId === null) {
        throw new InternalServerError('Address was not created. Please try again.');
    }

    const builder = new InsertQueryBuilder();
    builder
        .insert(['users_id', 'addresses_id', 'statuses_id'])
        .into('orders')
        .values([['?', '?', '?']]);

    const createOrderQuery = builder.build();
    const createOrderValues = [usersId, addressId, 200];

    const createOrderResult = await createOrderQuery.run(connection, createOrderValues);
    if (createOrderResult.affectedRows === 0) {
        throw new InternalServerError('Order was not created. Please try again.');
    }
    const orderId = createOrderResult.insertId;
    await createOrderItems(connection, orderId, items);

    return orderId;
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder
};