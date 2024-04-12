const { promisePool } = require('../db');
const { BooksNotFoundError } = require('../exceptions/books-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');
const { 
    SelectQueryBuilder,
} = require('../utils/sql-utils');


const getAllBooks = async ({columns = ['*'], joins = [], offset = null, limit = null}) => {
    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => builder.join(j.table, j.on));

    const query = builder.build();
    const books = await query.run();

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBookById = async (id, options = {columns: ['*'], joins: []}) => {
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where(`id = ?`);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    const books = await builder.run();
    const book = books[0];

    if (!book) {
        throw new BooksNotFoundError();
    }

    return book;
};

const getBooksByAuthor = async (authors_id, options = {columns: ['*'], joins: [], limit: null}) => {
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where(`authors_id = ?`);
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    const books = await query.run([authors_id]);

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBooksByCategory = async (
    categories_id, 
    options = {columns: ['*'], joins: [], limit: null, offset: null}
) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where('`categories_id` = ?');
    if (options.limit) builder.limit(options.limit);
    if (options.offset) builder.offset(options.offset);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    books = await query.run([categories_id]);

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

const getBooksReleasedInTheLastMonth = async (options = {columns: ['*'], joins: [], limit: null}) => {
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books')
    builder.where('created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    if (options.limit) builder.limit(options.limit);
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    const books = await query.run();

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