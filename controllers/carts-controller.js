const { StatusCodes } = require('http-status-codes');

const {
    BadRequestError,
    InternalServerError,
    NotFoundError
} = require('../exceptions/generic-exceptions');
const { 
    getAllCarts,
    getAllCartsSequelize, 
    createCart,
    addItemToCart,
    deleteItemsFromCart,
    editItemInCart
} = require('../services/carts-service');

const { promisePool, sequelize } = require('../db');

const { Op } = require('sequelize');


const fetchAllCarts = async (req, res, next) => {
    try {
        const carts = await getAllCarts({columns: ['id', 'name', 'description']});
        return res.status(StatusCodes.OK).json(carts);
    } catch (error) {
        next(error);
    }
};

const fetchCart = async (req, res, next) => {
    const { cartsId } = req.params;
    const { selected } = req.body;
    const { user } = req;

    const where = [
        `carts.id = ${cartsId}`,
        `carts.users_id = ${user.sub}`,
        `prices.created_at = (SELECT MAX(created_at) FROM prices p WHERE p.books_id = books.id)`
    ];

    try {
        if (selected) {
            if (Array.isArray(selected) === false) {
                throw new BadRequestError('Books IDs should be an array.');
            }
            const isBooksIdsValid = selected.every(id => Number.isInteger(id));
            if (isBooksIdsValid === false) {
                throw new BadRequestError('Books IDs must be integers.');
            }

            where.push(`carts_items.books_id IN (${selected.join(',')})`);
        }
    } catch (error) {
        next(error);
        return;
    }

    const queryOptions = {
        select: [
            'carts_items.books_id AS book_id', 
            'carts_items.amount', 
            'books.title AS book_title', 
            'authors.id AS author_id',
            'authors.name AS author_name',
            'categories.id AS category_id',
            'categories.name AS category_name',
            'prices.price'
        ],
        joins: [
            {
                table: 'carts_items',
                on: 'carts.id = carts_items.carts_id',
                type: 'LEFT'
            },
            {
                table: 'books',
                on: 'carts_items.books_id = books.id',
                type: 'LEFT'
            },
            {
                table: 'authors',
                on: 'books.authors_id = authors.id',
                type: 'LEFT'
            },
            {
                table: 'categories',
                on: 'books.categories_id = categories.id',
                type: 'LEFT'
            },
            {
                table: 'prices',
                on: 'books.id = prices.books_id',
                type: 'LEFT'
            }
        ],
        where
    };

    try {
        const carts = await getAllCarts(queryOptions);
        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }

        return res.status(StatusCodes.OK).json(carts);
    }
    catch (error) {
        next(error);
    }
};

const fetchSelectedItemsFromCart = async (req, res, next) => {
    const { cartsId } = req.params;
    const { selected } = req.body;
    const { user } = req;

    const where = [
        `carts.id = ${cartsId}`,
        `carts.users_id = ${user.sub}`,
        `prices.created_at = (SELECT MAX(created_at) FROM prices p WHERE p.books_id = books.id)`
    ];

    try {
        if (selected) {
            if (Array.isArray(selected) === false) {
                throw new BadRequestError('Books IDs should be an array.');
            }
            const isBooksIdsValid = selected.every(id => Number.isInteger(id));
            if (isBooksIdsValid === false) {
                throw new BadRequestError('Books IDs must be integers.');
            }
            where.push(`carts_items.books_id IN (${selected.join(',')})`);
        }
    } catch (error) {
        next(error);
        return;
    }

    
    const queryOptions = {
        select: [
            'carts_items.books_id', 
            'carts_items.amount', 
            'books.title', 
            'authors.name',
            'authors.id',
            'categories.name',
            'categories.id',
            'prices.price'
        ],
        joins: [
            {
                table: 'carts_items',
                on: 'carts.id = carts_items.carts_id',
                type: 'LEFT'
            },
            {
                table: 'books',
                on: 'carts_items.books_id = books.id',
                type: 'LEFT'
            },
            {
                table: 'authors',
                on: 'books.authors_id = authors.id',
                type: 'LEFT'
            },
            {
                table: 'categories',
                on: 'books.categories_id = categories.id',
                type: 'LEFT'
            },
            {
                table: 'prices',
                on: 'books.id = prices.books_id',
                type: 'LEFT'
            }
        ],
        where
    };

    try {
        const carts = await getAllCarts(queryOptions);
        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }
        return res.status(StatusCodes.OK).json(carts);
    } catch (error) {
        next(error);
    }
};

const addCart = async (req, res, next) => {
    const { name = "Cart", description = "Cart for Items" } = req.body;
    const { user } = req;


    const transaction = await sequelize.transaction();
    try {
        const cart = await createCart(
            transaction, 
            user.sub, 
            name, 
            description
        );
        if (cart == null) {
            throw new InternalServerError('Cart was not created. Please try again.');
        }

        await transaction.commit();
        return res.status(StatusCodes.CREATED).json({ id: cart.id });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const addCartItem = async (req, res, next) => {
    const { booksId, quantity } = req.body;
    const { cartsId } = req.params;
    const { user } = req;

    const transaction = await sequelize.transaction();

    try {
        const carts = await getAllCarts({
            select: ['id'],
            where: [`users_id = ${user.sub}`, `id = ${cartsId}`],
        });

        // Check if cart exists, if not create one
        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }

        const cart = carts[0];
        const cartsItem = await addItemToCart(transaction, cart.id, booksId, quantity);

        await transaction.commit();
        return res.status(StatusCodes.CREATED).json({ carts_items_id : cartsItem.id, carts_id: cart.id});
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const deleteCartItem = async (req, res, next) => {
    const { cartsId, booksId } = req.params;
    const { user } = req;


    const transaction = await sequelize.transaction();

    try {
        const carts = await getAllCarts({
            select: ['id'],
            where: [`users_id = ${user.sub}`, `id = ${cartsId}`],
        });

        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }

        await deleteItemsFromCart([booksId], cartsId, {transaction});
        await transaction.commit();
        return res.status(StatusCodes.OK).end();
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const editCartItem = async (req, res, next) => {
    const { cartsId, booksId } = req.params;
    const { user } = req;
    const { quantity } = req.body;

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        const carts = await getAllCarts({
            select: ['id'],
            where: [`users_id = ${user.sub}`, `id = ${cartsId}`],
        });

        if (carts.length === 0) {
            throw new NotFoundError('Cart not found.');
        }

        const isItemEdited = await editItemInCart(connection, cartsId, booksId, quantity);
        if (isItemEdited === false) {
            throw new NotFoundError('Item not found in cart.');
        }

        await connection.commit();
        return res.status(StatusCodes.OK).end();
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};


module.exports = {
    addCart,
    addCartItem,
    deleteCartItem,
    editCartItem,
    fetchAllCarts,
    fetchCart,
    fetchSelectedItemsFromCart
};