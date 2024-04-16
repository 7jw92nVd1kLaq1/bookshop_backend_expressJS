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

const getAllCarts = async (options = {}, values = []) => {
    const {
        columns = ['*'],
        wheres = [],
        joins = [],
        offset = null,
        limit = null,
        orderBy = [],
        groupBy = [],
        having = []
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('carts');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => {
        builder.join(j.table, j.on, j.type ? j.type : 'INNER');
    });
    wheres.forEach(w => builder.where(w));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    groupBy.forEach(g => builder.groupBy(g));
    having.forEach(h => builder.having(h));

    const query = builder.build();
    const carts = await query.run(values);

    if (!carts.length) {
        return [];
    }

    return carts;
};

const createCart = async (
    connection, 
    users_id, 
    name,
    description
) => {
    if (users_id == null) {
        throw new BadRequestError('User ID is required');
    }
    const builder = new InsertQueryBuilder();
    builder
        .insert(['users_id', 'name', 'description'])
        .into('carts')
        .values([['?', '?', '?']]);
    
    const query = builder.build();
    const result = await query.run(connection, [users_id, name, description]);
    
    if (result.affectedRows === 0) {
        return null;
    }

    return result.insertId;
};

const deleteCart = async (connection, carts_id) => {
    if (carts_id == null) {
        throw new Error('Cart ID is required');
    }
    const builder = new DeleteQueryBuilder();
    builder
        .from('carts')
        .where('id = ?');
    
    const query = builder.build();
    const result = await query.run(connection, [carts_id]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};

const editCart = async (connection, carts_id, name, description) => {
    if (carts_id == null) {
        throw new Error('Cart ID is required');
    }
    if (name == null && description == null) {
        throw new Error('Name or description is required');
    }

    const builder = new UpdateQueryBuilder();
    builder
        .table('carts')
        .where('id = ?');
    if (name) builder.set('name', '?');
    if (description) builder.set('description', '?');
    
    const query = builder.build();
    const result = await query.run(connection, [name, description, carts_id]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};

const addItemToCart = async (connection, carts_id, books_id, quantity = 1) => {
    if (carts_id == null || books_id == null) {
        throw new BadRequestError('Cart ID and Items ID are required.');
    }
    if (quantity < 1) {
        throw new BadRequestError('Quantity should be greater than 0.');
    }

    const builder = new InsertQueryBuilder();
    builder
        .insert(['carts_id', 'books_id', 'amount'])
        .into('carts_items')
        .values([['?', '?', '?']]);
    
    const query = builder.build();
    const result = await query.run(connection, [carts_id, books_id, quantity]);

    if (result.affectedRows === 0) {
        return null;
    }

    return result.insertId;
};

const deleteItemFromCart = async (connection, carts_id, books_id) => {
    if (carts_id == null || books_id == null) {
        throw new BadRequestError('Cart ID and Items ID are required.');
    }

    const builder = new DeleteQueryBuilder();
    builder
        .from('carts_items')
        .where('carts_id = ?')
        .where('books_id = ?');
    
    const query = builder.build();
    const result = await query.run(connection, [carts_id, books_id]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
}

const editItemInCart = async (connection, carts_id, books_id, quantity) => {
    if (carts_id == null || books_id == null) {
        throw new BadRequestError('Cart ID and Items ID are required.');
    }
    if (quantity < 1) {
        throw new BadRequestError('Quantity should be greater than 0.');
    }

    const builder = new UpdateQueryBuilder();
    builder
        .table('carts_items')
        .where('carts_id = ?')
        .where('books_id = ?')
        .set('amount', '?');
    
    const query = builder.build();
    const result = await query.run(connection, [quantity, carts_id, books_id]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};


module.exports = {
    getAllCarts,
    createCart,
    deleteCart,
    editCart,
    addItemToCart,
    deleteItemFromCart,
    editItemInCart
};