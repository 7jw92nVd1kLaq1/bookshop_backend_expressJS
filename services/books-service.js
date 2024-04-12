const { promisePool } = require('../db');
const { BooksNotFoundError } = require('../exceptions/books-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');
const { 
    SelectQueryBuilder,
} = require('../utils/sql-utils');


const getAllBooks = async ({columns = ['*'], joins = [], offset = null, limit = null}) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await promisePool.query(query);
        books = rows;
    } catch (error) {
        console.log(`DB error occurred in "getAllBooks": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching books. Please try again.');
    }

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBookById = async (id, options = {columns: ['*'], joins: [], limit: null}) => {
    let book;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where(`id = ?`);
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [results] = await promisePool.query(query, [id]);
        book = results[0];
    } catch (error) {
        console.log(`DB error occurred in "getBookById": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching book. Please try again.');
    }

    if (!book) {
        throw new BooksNotFoundError();
    }

    return book;
};

const getBooksByAuthor = async (authors_id, options = {columns: ['*'], joins: [], limit: null}) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where(`authors_id = ?`);
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await promisePool.query(query, [authors_id]);
        books = rows;
    } catch (error) {
        console.log(`DB error occurred in "getBooksByAuthor": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching books. Please try again.');
    }

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBooksByCategory = async (categories_id, options = {columns: ['*'], joins: [], limit: null}) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where('`categories_id` = ?');
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await promisePool.query(query, [categories_id]);
        books = rows;
    } catch (error) {
        console.log(`DB error occurred in "getBooksByCategory": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching books. Please try again.');
    }

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

const getBooksReleasedInTheLastMonth = async (options = {columns: ['*'], joins: [], limit: null}) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books')
    builder.where('created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await promisePool.query(query);
        books = rows;
    } catch (error) {
        console.log(`DB error occurred in "getBooksReleasedInTheLastMonth": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching books. Please try again.');
    }

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

module.exports = {
    getAllBooks,
    getBookById,
    getBooksByAuthor,
    getBooksByCategory,
    getBooksReleasedInTheLastMonth
};