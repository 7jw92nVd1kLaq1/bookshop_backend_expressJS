const pool = require('../db');
const { BooksNotFoundError } = require('../exceptions/books-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');
const { 
    SelectQueryBuilder,
} = require('../utils/sql-utils');


const getAllBooks = async (columns = ['*'], joins = []) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books');
    joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await pool.query(query);
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

const getBookById = async (id, columns = ['*'], joins = []) => {
    let book;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where(`id = ?`);
    joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [results] = await pool.query(query, [id]);
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

const getBooksByAuthor = async (authors_id, columns = ['*'], joins = []) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where(`authors_id = ?`);
    joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await pool.query(query, [authors_id]);
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

const getBooksByCategory = async (categories_id, columns = ['*'], joins = []) => {
    let books;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where('`categories_id` = ?');
    joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [rows] = await pool.query(query, [categories_id]);
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

module.exports = {
    getAllBooks,
    getBookById,
    getBooksByAuthor,
    getBooksByCategory
};