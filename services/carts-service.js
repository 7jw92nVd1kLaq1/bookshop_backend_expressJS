const { 
    SelectQueryBuilder, 
    DeleteQueryBuilder,
    UpdateQueryBuilder,
} = require('../utils/sql-utils');

const {
    BadRequestError,
    InternalServerError
} = require('../exceptions/generic-exceptions');

const {
    Carts,
    CartsItems
} = require('../models/carts-models');


const getAllCartsSequelize = async (options = {}) => {
    if (typeof options !== 'object') {
        throw new BadRequestError('Options must be an object.');
    }

    const carts = await Carts.findAll(options);
    return carts;
};

const getAllCarts = async (options = {}, values = []) => {
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
    builder.select(select).from('carts');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => {
        builder.join(j.table, j.on, j.type ? j.type : 'INNER');
    });
    where.forEach(w => builder.where(w));
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
    transaction,
    usersId, 
    name,
    description
) => {
    if (usersId == null) {
        throw new BadRequestError('User ID is required');
    }

    const cart = await Carts.create({
        usersId,
        name,
        description
    }, {transaction});

    if (cart == null) {
        throw new InternalServerError('Cart was not created. Please try again.');
    }

    return cart;
};

const deleteCart = async (connection, cartsId) => {
    if (cartsId == null) {
        throw new Error('Cart ID is required');
    }
    const builder = new DeleteQueryBuilder();
    builder
        .from('carts')
        .where('id = ?');
    
    const query = builder.build();
    const result = await query.run(connection, [cartsId]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};

const editCart = async (connection, cartsId, name, description) => {
    if (cartsId == null) {
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
    const result = await query.run(connection, [name, description, cartsId]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};

const addItemToCart = async (transaction, cartsId, booksId, quantity = 1) => {
    if (cartsId == null || booksId == null) {
        throw new BadRequestError('Cart ID and Items ID are required.');
    }
    if (quantity < 1) {
        throw new BadRequestError('Quantity should be greater than 0.');
    }

    let cart = await Carts.findOne({
        where: {
            id: cartsId
        }
    }, {transaction});

    if (cart == null) {
        throw new InternalServerError('Cart was not found. Please try again.');
    }

    const cartsItem = await CartsItems.create({
        cartsId: cart.id,
        booksId,
        amount: quantity
    }, {transaction});

    if (cartsItem == null) {
        throw new InternalServerError('Item was not added to cart. Please try again.');
    }

    return cartsItem;
};

const deleteItemsFromCart = async (booksId, cartsId, destoryOptions = {}) => {
    if (cartsId == null || booksId == null) {
        throw new BadRequestError('Cart ID and Items ID are required.');
    }
    if (Array.isArray(booksId) && booksId.length === 0) {
        throw new BadRequestError('Books ID should be an array and not empty.');
    }

    const queryOptions = {
        where: {
            cartsId,
            booksId,
        }
    };

    const result = await CartsItems.destroy(queryOptions, destoryOptions);
    if (result != booksId.length) {
        throw new InternalServerError('Items were not deleted from cart. Please try again.');
    }
    return true;
}

const editItemInCart = async (connection, cartsId, booksId, quantity) => {
    if (cartsId == null || booksId == null) {
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
    const result = await query.run(connection, [quantity, cartsId, booksId]);

    if (result.affectedRows === 0) {
        return false;
    }

    return true;
};


module.exports = {
    getAllCarts,
    getAllCartsSequelize,
    createCart,
    deleteCart,
    editCart,
    addItemToCart,
    deleteItemsFromCart,
    editItemInCart
};