const {
    createOrder,
    getOrderById,
    getAllOrders,
    getAllOrdersSequelize
} = require('../services/orders-service');
const {
    getAllCartsSequelize,
    deleteItemsFromCart
} = require('../services/carts-service');
const { sequelize } = require('../db');
const { NotFoundError } = require('../exceptions/generic-exceptions');

const { StatusCodes } = require('http-status-codes');

const { Authors } = require('../models/authors-models');
const { Books, Prices } = require('../models/books-models');
const { Addresses, Orders, OrdersBooks, Statuses } = require('../models/orders-models');


const addOrder = async (req, res, next) => {
    const { user } = req;
    const { books, address } = req.body;

    const transaction = await sequelize.transaction();
    try {
        // delete items from cart
        const cartItems = books.map(book => book.booksId);
        const carts = await getAllCartsSequelize({ where: { usersId: user.sub } });
        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }

        await deleteItemsFromCart(cartItems, carts[0].id, {transaction});

        // Create order
        const newOrder = await createOrder(transaction, user.sub, books, address);

        await transaction.commit();
        return res.status(StatusCodes.CREATED).json(newOrder);
    } catch (error) {
        await transaction.rollback();
        next(error);
    } 
};

const fetchOrder = async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;


    const sequelizeQueryOptions = {
        attributes: [['id', 'orderId'], 'createdAt', 'updatedAt'],
        include: [
            {
                model: Addresses,
                attributes: [
                    ['id', 'addressId'],
                    'recipient',
                    'phoneNumber',
                    'address1',
                    'address2',
                    'city',
                    'state',
                    'country',
                    'postalCode'
                ],
                required: false
            },
            {
                model: Statuses,
                attributes: [
                    'name', 
                    ['id', 'statusId']
                ],
                required: false
            }
        ]
    };

    const booksQueryOptions = {
        select: [
            'books.id AS bookId',
            'books.title',
            'books.description',
            'books.authors_id AS authorId',
            'authors.name AS authorName',
            'books.categories_id AS categoryId',
            'categories.name AS categoryName',
            'prices.price',
            'orders_books.amount',
            'prices.price * orders_books.amount as totalPrice',
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

    try {
        const orders = await getAllOrdersSequelize(sequelizeQueryOptions);
        if (orders.length === 0) {  
            throw new NotFoundError('Orders not found');
        }

        const books = await getOrderById(id, user.sub, booksQueryOptions);
        if (books === null) {
            throw new NotFoundError('Books for order not found');
        }

        const order = orders[0].dataValues;
        order.books = books;

        return res.status(StatusCodes.OK).json(order);
    } catch (error) {
        next(error);
    }
};

const fetchAllOrders = async (req, res, next) => {
    const { page, amount } = req.query;
    const { user } = req;

    let jsonResponse = {};

    const queryOptions = {
        select: [
            'orders.id AS ordersId',
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
        offset: page ? (page - 1) * amount : null,
        orderBy: [
            {
                column: 'orders.created_at',
                order: 'DESC'
            }
        ]
    };

    const ordersBooksQueryOptions = {
        select: [
            'orders_books.orders_id AS ordersId',
            'books.id AS booksId',
            'books.title AS booksTitle',
            'books.authors_id AS authorsId',
            'authors.name AS author',
            'prices.price',
            'orders_books.amount',
            'prices.price * orders_books.amount as totalPrice',
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
            'orders.id IN (?)'
        ]
    };

    const userOrdersCount = await Orders.count({
        where: {
            usersId: user.sub
        }
    });

    try {
        const orders = await getAllOrders(queryOptions, [user.sub]);
        if (orders.length === 0) {
            throw new NotFoundError('Orders not found');
        }

        const ordersBooks = await getAllOrders(
            ordersBooksQueryOptions, 
            [orders.map(order => order.ordersId)],
            true
        );
        if (ordersBooks.length === 0) {
            throw new NotFoundError('Orders books not found');
        }

        // Prepare return data
        for (let i = 0; i < orders.length; i++) {
            orders[i].books = ordersBooks.filter(book => book.ordersId === orders[i].ordersId);
        }

        jsonResponse.pagination = {
            currentPage: page ? parseInt(page) : 1,
            totalPages: Math.ceil(userOrdersCount / (amount ? amount : userOrdersCount)),
            totalItems: userOrdersCount
        };
        jsonResponse.orders = orders;

        return res.status(StatusCodes.OK).json(jsonResponse);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addOrder,
    fetchOrder,
    fetchAllOrders
};