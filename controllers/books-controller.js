const { StatusCodes } = require('http-status-codes');
const { promisePool } = require('../db');

const {
    createBooks,
    createBooksLike,
    deleteBooksLike,
    getAllBooks,
    getBookById,
} = require('../services/books-service');
const {
    BooksNotFoundError
} = require('../exceptions/books-exceptions');


const addBooks = async (req, res, next) => {
    const books = req.body;
    if (Array.isArray(books) === false || books.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).send('Invalid request body');
    }

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        const newBooks = await createBooks(connection, books);
        await connection.commit();

        return res.status(StatusCodes.CREATED).json(newBooks);
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const fetchAllBooks = async (req, res, next) => {
    const { page, amount } = req.query;
    const { user } = req;

    const queryOptions = {
        columns: [
            'books.*', 
            'categories.name as categories_name',
            'authors.name as authors_name',
            'COUNT(books_likes.books_id) as likes',
        ],
        joins: [
            {table: 'books_likes', on: 'books.id = books_likes.books_id', type: 'LEFT'},
            {table: 'categories', on: 'books.categories_id = categories.id', type: 'LEFT'},
            {table: 'authors', on: 'books.authors_id = authors.id', type: 'LEFT'},
        ],
        limit: amount,
        offset: page ? (page - 1) * amount : null,
        groupBy: ['books.id']
    };

    // Add liked column if user is logged in
    if (user && user.sub) {
        queryOptions.columns.push(`IF(books_likes.users_id = ${user.sub}, TRUE, FALSE) as liked`);
    }

    try {
        const books = await getAllBooks(queryOptions);
        if (books.length === 0)
            throw new BooksNotFoundError();

        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

const fetchBookById = async (req, res, next) => {
    let { id } = req.params;
    const { user } = req;

    const queryOptions = {
        columns: [
            'books.*',
            'categories.name as categories_name',
            'authors.name as authors_name',
            'COUNT(books_likes.books_id) as likes',
        ],
        joins: [
            {table: 'books_likes', on: 'books.id = books_likes.books_id', type: 'LEFT'},
            {table: 'categories', on: 'books.categories_id = categories.id', type: 'LEFT'},
            {table: 'authors', on: 'books.authors_id = authors.id', type: 'LEFT'},
        ],
        groupBy: ['books.id']
    };

    // Add liked column if user is logged in
    if (user && user.sub) {
        queryOptions.columns.push(`IF(books_likes.users_id = ${user.sub}, TRUE, FALSE) as liked`);
    }

    try {
        const book = await getBookById(id, queryOptions);
        if (book === null)
            throw new BooksNotFoundError();

        return res.status(StatusCodes.OK).json(book);
    } catch (error) {
        next(error);
    }
};

const fetchBooksByRecent = async (req, res, next) => {
    let { page, amount, months, days } = req.query;
    const { user } = req;

    try {
        let dateCondition = '';
        if (months) dateCondition = `${months} MONTH `;
        if (days) dateCondition = `${days} DAY`;
        if (!dateCondition) dateCondition = '1 MONTH';

        const queryOptions = {
            columns: [
                'books.*', 
                'categories.name as categories_name',
                'authors.name as authors_name',
                'COUNT(books_likes.books_id) as likes',
            ],
            wheres: [
                `pub_date >= DATE_SUB(NOW(), INTERVAL ${dateCondition})`
            ],
            joins: [
                {table: 'categories', on: 'books.categories_id = categories.id', type: 'LEFT'},
                {table: 'authors', on: 'books.authors_id = authors.id', type: 'LEFT'},
                {table: 'books_likes', on: 'books.id = books_likes.books_id', type: 'LEFT'},
            ],
            limit: amount ? amount : null,
            offset: page ? (page - 1) * amount : null,
            groupBy: ['books.id'],
            orderBy: [{ column: 'pub_date', order: 'DESC' }]
        };
        
        // Add liked column if user is logged in
        if (user && user.sub) {
            queryOptions.columns.push(`IF(books_likes.users_id = ${user.sub}, TRUE, FALSE) as liked`);
        }

        const books = await getAllBooks(queryOptions);
        if (books.length === 0)
            throw new BooksNotFoundError();

        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

const fetchBooksByPopular = async (req, res, next) => {
    let { page, amount } = req.query;
    const { user } = req;

    try {
        const queryOptions = {
            columns: [
                'books.*', 
                'categories.name as categories_name',
                'authors.name as authors_name',
                'COUNT(books_likes.books_id) as likes',
            ],
            joins: [
                {table: 'categories', on: 'books.categories_id = categories.id', type: 'LEFT'},
                {table: 'authors', on: 'books.authors_id = authors.id', type: 'LEFT'},
                {table: 'books_likes', on: 'books.id = books_likes.books_id', type: 'LEFT'},
            ],
            limit: amount ? amount : null,
            offset: page ? (page - 1) * amount : null,
            groupBy: ['books.id'],
            orderBy: [{ column: 'likes', order: 'DESC' }]
        };
        
        // Add liked column if user is logged in
        if (user && user.sub) {
            queryOptions.columns.push(`IF(books_likes.users_id = ${user.sub}, TRUE, FALSE) as liked`);
        }

        const books = await getAllBooks(queryOptions);
        if (books.length === 0)
            throw new BooksNotFoundError();

        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

const likeBook = async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        const book = await getBookById(id, { columns: ['id']});
        if (book === null) {
            throw new BooksNotFoundError();
        }
        await createBooksLike(connection, id, user.sub);

        await connection.commit();
        return res.status(StatusCodes.OK).end();
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const unlikeBook = async (req, res, next) => {
    const { id } = req.params;
    const { user } = req;

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        const book = await getBookById(id, { columns: ['id']});
        if (book === null) {
            throw new BooksNotFoundError();
        }
        await deleteBooksLike(connection, id, user.sub);
        await connection.commit();
        return res.status(StatusCodes.OK).end();
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const fetchBooksLikes = async (req, res, next) => {
    const { id } = req.params;

    try {
        const likes = await getAllBooks({
            columns: [
                'books.id', 'books.title',
                'COUNT(books_likes.books_id) as likes'
            ],
            wheres: [`books.id = ${id}`],
            joins: [
                {table: 'books_likes', on: 'books.id = books_likes.books_id', type: 'LEFT'}
            ],
            groupBy: ['books.id']
        });

        return res.status(StatusCodes.OK).json(likes[0]);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addBooks,
    likeBook,
    unlikeBook,
    fetchAllBooks,
    fetchBooksLikes,
    fetchBookById,
    fetchBooksByRecent,
};