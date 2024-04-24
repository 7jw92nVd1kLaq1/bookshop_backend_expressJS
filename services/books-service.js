const { BooksNotFoundError } = require('../exceptions/books-exceptions');
const { BadRequestError, InternalServerError, NotFoundError } = require('../exceptions/generic-exceptions');
const { 
    InsertQueryBuilder,
    SelectQueryBuilder,
} = require('../utils/sql-utils');

const { Books, BooksLikes } = require('../models/books-models');


// a function for removing unwanted keys from a book object
const sanitizeBook = (book) => {
    const sanitizedBook = {};
    const validKeys = [
        'title', 
        'description', 
        'authors_id', 
        'categories_id', 
        'page_number',
        'isbn',
        'pub_date',
        'publishers',
        'price',
        'form'
    ];

    for (let key of validKeys) {
        if (book[key]) {
            sanitizedBook[key] = book[key];
        }
    }

    if (!book['title']) {
        throw new Error('Book title is required');
    }

    return sanitizedBook;
};

const getAllBooksSequelize = async (options = {}) => {
    if (typeof options !== 'object') {
        throw new BadRequestError('Options must be an object.');
    }

    const books = await Books.findAll(options);
    if (books.length === 0) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getAllBooks = async (options = {}, values = []) => {
    const {
        columns = ['*'],
        wheres = [],
        joins = [],
        offset = null,
        limit = null,
        orderBy = [],
        groupBy = [],
        having = []
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => {
        builder.join(j.table, j.on, j.type ? j.type : 'INNER');
    });
    wheres.forEach(w => builder.where(w));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    groupBy.forEach(g => builder.groupBy(g));
    having.forEach(h => builder.having(h));

    const query = builder.build();
    const books = await query.run(values);

    if (!books.length) {
        return [];
    }

    return books;
};

const getBookById = async (id, options = {}) => {
    const {
        columns = ['*'],
        joins = [],
        groupBy = [],
        having = []
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where('books.id = ?');
    if (joins) 
        joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));
    if (groupBy) groupBy.forEach(g => builder.groupBy(g));
    if (having) having.forEach(h => builder.having(h));

    const query = builder.build();
    const books = await query.run([id]);
    const book = books[0];

    if (!book) {
        return null;
    }

    return book;
};

const getBooksByAuthor = async (
    authors_id, 
    options = {}
) => {
    const {
        columns = ['*'],
        joins = [],
        limit = null
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where(`authors_id = ?`);
    if (limit) 
        builder.limit(limit);
    if (joins) 
        joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

    const query = builder.build();
    const books = await query.run([authors_id]);

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBooksByCategory = async (
    categories_id, 
    options = {}
) => {
    const { 
        columns = ['*'],
        joins = [],
        limit = null,
        offset = null
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books').where('`categories_id` = ?');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    if (joins) 
        joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

    const query = builder.build();
    const books = await query.run([categories_id]);

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

const getBooksReleasedInTheLastMonth = async (options = {}) => {
    const {
        columns = ['*'],
        joins = [],
        offset = null,
        limit = null
    } = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books')
    builder.where('created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    if (limit) builder.limit(limit);
    if (offset) builder.offset(offset);
    joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

    const query = builder.build();
    const books = await query.run();

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

const createBooks = async (connection, books) => {
    // define the columns that are required for creating a book
    const sanitizedBooks = books.map(b => sanitizeBook(b));
    const insertColumns = Object.keys(sanitizedBooks[0]);
    if (insertColumns.length === 0) {
        throw new BadRequestError('All books are missing required keys.');
    }
    for (let book of sanitizedBooks) {
        if (Object.keys(book).length !== insertColumns.length) {
            throw new BadRequestError('All books must have the same keys.');
        }
    }

    // transform an array of book objects into a one-dimensional array of values
    const values = sanitizedBooks.map(b => {
        const mappedValues = insertColumns.map(key => b[key]);
        if (mappedValues.includes(undefined)) {
            throw new BadRequestError('Some books are missing required keys. The first book you send defines all the required keys.');
        }
        return mappedValues;
    });

    // create a list of placeholders for each book object
    const builder = new InsertQueryBuilder();
    builder
        .insert(insertColumns)
        .into('books')
        .values(['?']);

    const query = builder.build();
    const result = await query.run(connection, values);

    if (result.affectedRows === 0) {
        throw new InternalServerError('Books were not created. Please try again.');
    }
    if (result.affectedRows != books.length) {
        throw new InternalServerError('Some books were not created. Please try again.');
    }

    return sanitizedBooks;
};

const createBooksLike = async (books_id, users_id, transaction = null) => {
    if (books_id == null || users_id == null) {
        throw new BadRequestError('Books ID and Users ID are required.');
    }

    const queryOptions = {
        books_id,
        users_id
    };
    const createOptions = {};
    if (transaction) createOptions.transaction = transaction;

    try {
        const booksLike = await BooksLikes.create(queryOptions, createOptions);
        if (booksLike == null) {
            throw new InternalServerError('Books like was not created. Please try again.');
        }
        return booksLike;
    }
    catch (error) {
        console.log(`DB error occurred in "createBooksLike": ${error.message}`);
        throw new InternalServerError('Error occurred while creating books like. Please try again.');
    }
};

const deleteBooksLike = async (books_id, users_id, transaction = null) => {
    if (books_id == null || users_id == null) {
        throw new BadRequestError('Books ID and Users ID are required.');
    }
    const queryOptions = {
        where: {
            books_id,
            users_id
        }
    };
    if (transaction) queryOptions.transaction = transaction;

    let booksLike;
    try {
        booksLike = await BooksLikes.destroy(queryOptions);
    } catch (error) {
        console.log(`DB error occurred in "deleteBooksLike": ${error.message}`);
        throw new InternalServerError('Error occurred while deleting books like. Please try again.');
    }

    if (booksLike == 0) {
        throw new NotFoundError('Books like was not found.');
    }
};

module.exports = {
    createBooks,
    createBooksLike,
    deleteBooksLike,
    getAllBooks,
    getAllBooksSequelize,
    getBookById,
    getBooksByAuthor,
    getBooksByCategory,
    getBooksReleasedInTheLastMonth,
};