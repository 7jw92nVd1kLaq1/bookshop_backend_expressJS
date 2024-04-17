const { StatusCodes } = require('http-status-codes');

const {
    BadRequestError,
    InternalServerError,
    NotFoundError
} = require('../exceptions/generic-exceptions');
const { 
    getAllCarts, 
    createCart,
    addItemToCart,
    deleteItemsFromCart,
    editItemInCart
} = require('../services/carts-service');

const { promisePool } = require('../db');


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
    const { user } = req;

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
        where: [
            `carts.id = ${cartsId}`,
            `carts.users_id = ${user.sub}`,
            'prices.created_at = (SELECT MAX(created_at) FROM prices p WHERE p.books_id = books.id)'
        ],
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
    const { booksIds } = req.body;
    const { user } = req;

    try {
        if (booksIds === undefined || booksIds.length === 0) {
            throw new BadRequestError('Books IDs are required.');
        }
        const isBooksIdsValid = booksIds.every(id => Number.isInteger(id));
        if (isBooksIdsValid === false) {
            throw new BadRequestError('Books IDs must be integers.');
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
        where: [
            `carts.id = ${cartsId}`,
            `carts.users_id = ${user.sub}`,
            `carts_items.books_id IN (${booksIds.join(',')})`,
            'prices.created_at = (SELECT MAX(created_at) FROM prices p WHERE p.books_id = books.id)'
        ],
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

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        const cartId = await createCart(connection, user.sub, name, description);
        if (cartId === null) {
            throw new InternalServerError('Cart was not created. Please try again.');
        }
        await connection.commit();
        return res.status(StatusCodes.CREATED).json({ id: cartId });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const addCartItem = async (req, res, next) => {
    const { booksId, quantity } = req.body;
    const { cartsId } = req.params;
    const { user } = req;

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    let cart;
    try {
        const carts = await getAllCarts({
            select: ['id'],
            where: [`users_id = ${user.sub}`, `id = ${cartsId}`],
        });
        // Check if cart exists, if not create one
        if (carts.length === 0) {
            const cartId = await createCart(connection, user.sub, "Cart", "Cart for Items");
            if (cartId === null) {
                throw new InternalServerError('Cart was not created. Please try again.');
            }
            cart = { id: cartId };
        } else {
            cart = carts[0];
        }

        const cartItemId = await addItemToCart(connection, cart.id, booksId, quantity);
        if (cartItemId === null) {
            throw new InternalServerError('Item was not added to cart. Please try again.');
        }
        await connection.commit();
        return res.status(StatusCodes.CREATED).json({ id: cartItemId });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const deleteCartItem = async (req, res, next) => {
    const { cartsId, booksId } = req.params;
    const { user } = req;

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

        await deleteItemsFromCart(connection, cartsId, [booksId]);
        await connection.commit();
        return res.status(StatusCodes.OK).end();
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
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