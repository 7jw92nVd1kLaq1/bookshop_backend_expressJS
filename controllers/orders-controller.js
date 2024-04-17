const {
    createOrder,
    getOrderById,
    getAllOrders
} = require('../services/orders-service');
const {
    deleteItemsFromCart
} = require('../services/carts-service');
const { promisePool } = require('../db');
const { NotFoundError } = require('../exceptions/generic-exceptions');

const { StatusCodes } = require('http-status-codes');


const addOrder = async (req, res, next) => {
    const { user } = req;
    const { books, address, carts_id } = req.body;

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        // Create order
        const newOrder = await createOrder(connection, user.sub, books, address);

        // Delete items from cart
        const cartItems = books.map(book => book.books_id);
        await deleteItemsFromCart(connection, carts_id, cartItems);

        await connection.commit();
        return res.status(StatusCodes.CREATED).json(newOrder);
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const fetchOrder = async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const queryOptions = {
        select: [
            'prices.price * orders_books.amount as total_price',
            'books.id',
            'books.title',
            'books.description',
            'books.authors_id',
            'books.categories_id',
        ],
        joins: [
            {
                table: 'orders_books',
                on: 'orders.id = orders_books.orders_id',
                type: 'INNER'
            },
            {
                table: 'prices',
                on: 'orders_books.prices_id = prices.id',
                type: 'INNER'
            },
            {
                table: 'books',
                on: 'prices.books_id = books.id',
                type: 'INNER'
            }
        ]
    };

    try {
        const order = await getOrderById(id, user.sub, queryOptions);
        if (order === null) {
            throw new NotFoundError('Order not found');
        }

        return res.status(StatusCodes.OK).json(order);
    } catch (error) {
        next(error);
    }
};

const fetchAllOrders = async (req, res, next) => {
    const { page, amount } = req.query;
    const { user } = req;

    const queryOptions = {
        where: [
            `users_id = ?`
        ],
        limit: amount,
        offset: page ? (page - 1) * amount : null
    };

    try {
        const orders = await getAllOrders(queryOptions, [user.sub]);
        if (orders.length === 0) {
            throw new NotFoundError('Orders not found');
        }

        return res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addOrder,
    fetchOrder,
    fetchAllOrders
};