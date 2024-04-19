const {
    createOrder,
    getOrderById,
    getOrderAddress,
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

    const booksQueryOptions = {
        select: [
            'books.id AS books_id',
            'books.title',
            'books.description',
            'books.authors_id',
            'authors.name AS authors_name',
            'books.categories_id AS categories_id',
            'categories.name AS categories_name',
            'prices.price',
            'orders_books.amount',
            'prices.price * orders_books.amount as total_price',
        ],
        join: [
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
            },
            {
                table: 'authors',
                on: 'books.authors_id = authors.id',
                type: 'INNER'
            },
            {
                table: 'categories',
                on: 'books.categories_id = categories.id',
                type: 'INNER'
            }
        ]
    };

    const orderQueryOptions = {
        select: [
            'addresses.recipient',
            'addresses.phone_number',
            'addresses.address1',
            'addresses.address2',
            'addresses.city',
            'addresses.state',
            'addresses.country',
            'addresses.postal_code',
            'statuses.name AS status',
            'statuses.id AS status_id'
        ],
        join: [
            {
                table: 'statuses',
                on: 'orders.statuses_id = statuses.id',
                type: 'INNER'
            },
            {
                table: 'addresses',
                on: 'orders.addresses_id = addresses.id',
                type: 'INNER'
            }
        ]
    };

    try {
        const orders = await getOrderById(id, user.sub, orderQueryOptions);
        const order = orders[0];
        if (order === null) {
            throw new NotFoundError('Order not found');
        }

        const books = await getOrderById(id, user.sub, booksQueryOptions);
        if (books === null) {
            throw new NotFoundError('Books for order not found');
        }

        // Remove addresses_id from books and prepare return data
        for (let i = 0; i < books.length; i++) {
            delete books[i].addresses_id;
        }

        const returnData = {};
        returnData.books = books;
        returnData.status = { status: order.status, status_id: order.status_id };

        delete order.status;
        delete order.status_id;
        returnData.address = order;

        return res.status(StatusCodes.OK).json(returnData);
    } catch (error) {
        next(error);
    }
};

const fetchAllOrders = async (req, res, next) => {
    const { page, amount } = req.query;
    const { user } = req;

    const queryOptions = {
        select: [
            'orders.id AS orders_id',
            'statuses.name AS status',
        ],
        where: [
            `orders.users_id = ?`
        ],
        join: [
            {
                table: 'statuses',
                on: 'orders.statuses_id = statuses.id',
                type: 'INNER'
            },
        ],
        limit: amount ? amount : null,
        offset: page ? (page - 1) * amount : null
    };

    const ordersBooksQueryOptions = {
        select: [
            'orders_books.orders_id AS orders_id',
            'books.id AS books_id',
            'books.title AS books_title',
            'books.authors_id',
            'authors.name AS author',
            'prices.price',
            'orders_books.amount',
            'prices.price * orders_books.amount as total_price',
        ],
        join: [
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
            },
            {
                table: 'authors',
                on: 'books.authors_id = authors.id',
                type: 'INNER'
            }
        ],
        where: [
            `orders.users_id = ?`
        ]
    };

    try {
        const orders = await getAllOrders(queryOptions, [user.sub]);
        if (orders.length === 0) {
            throw new NotFoundError('Orders not found');
        }

        const ordersBooks = await getAllOrders(ordersBooksQueryOptions, [user.sub]);
        if (ordersBooks.length === 0) {
            throw new NotFoundError('Orders books not found');
        }

        // Prepare return data
        for (let i = 0; i < orders.length; i++) {
            orders[i].books = ordersBooks.filter(book => book.orders_id === orders[i].orders_id);
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