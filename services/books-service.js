const { BooksNotFoundError } = require('../exceptions/books-exceptions');
const { BadRequestError } = require('../exceptions/generic-exceptions');
const { 
    InsertQueryBuilder,
    DeleteQueryBuilder,
    SelectQueryBuilder,
} = require('../utils/sql-utils');


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


const getAllBooks = async (
    {
        columns = ['*'], 
        wheres = [], 
        joins = [], 
        offset = null, 
        limit = null,
        orderBy = [],
        groupBy = [],
        having = []
    }
) => {
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
    console.log(query.getQueryString());
    const books = await query.run();

    if (!books.length) {
        throw new BooksNotFoundError();
    }

    return books;
};

const getBookById = async (id, options = {columns: ['*'], joins: [], groupBy: [], having: []}) => {
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where('books.id = ?');
    if (options.joins) 
        options.joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));
    if (options.groupBy) options.groupBy.forEach(g => builder.groupBy(g));
    if (options.having) options.having.forEach(h => builder.having(h));

    const query = builder.build();
    const books = await query.run([id]);
    const book = books[0];

    if (!book) {
        throw new BooksNotFoundError();
    }

    return book;
};

const getBooksByAuthor = async (
    authors_id, 
    options = {columns: ['*'], joins: [], limit: null}
) => {
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where(`authors_id = ?`);
    if (options.limit) 
        builder.limit(options.limit);
    if (options.joins) 
        options.joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

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
    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('books').where('`categories_id` = ?');
    if (options.limit) builder.limit(options.limit);
    if (options.offset) builder.offset(options.offset);
    if (options.joins) 
        options.joins.forEach(j => builder.join(j.table, j.on, j.type ? j.type : 'INNER'));

    const query = builder.build();
    const books = await query.run([categories_id]);

    if (books.length) {
        return books;
    }

    throw new BooksNotFoundError();
};

const getBooksReleasedInTheLastMonth = async ({columns = ['*'], joins = [], limit = null}) => {
    const builder = new SelectQueryBuilder();
    builder.select(columns).from('books')
    builder.where('created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    if (limit) builder.limit(limit);
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
    }).flat();

    // create a list of placeholders for each book object
    const placeholders = insertColumns.map(() => '?');
    const placeholdersList = books.map(b => [...placeholders]);

    const builder = new InsertQueryBuilder();
    builder
        .insert(insertColumns)
        .into('books')
        .values(placeholdersList);

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

const createBooksLike = async (connection, books_id, users_id) => {
    if (books_id == null || users_id == null) {
        throw new BadRequestError('Books ID and Users ID are required.');
    }

    const builder = new InsertQueryBuilder();
    builder
        .insert(['books_id', 'users_id'])
        .into('books_likes')
        .values([['?', '?']]);

    const query = builder.build();
    const result = await query.run(connection, [books_id, users_id]);

    if (result.affectedRows === 0) {
        throw new InternalServerError('Books like was not created. Please try again.');
    }

    return true;
};

const deleteBooksLike = async (connection, books_id, users_id) => {
    if (connection == null) {
        throw new BadRequestError('Connection is required.');
    }
    if (books_id == null || users_id == null) {
        throw new BadRequestError('Books ID and User ID are required.');
    }
    const builder = new DeleteQueryBuilder();
    builder
        .from('`books_likes`')
        .where('`books_id` = ?')
        .where('`users_id` = ?');

    const query = builder.build();
    const result = await query.run(connection, [books_id, users_id]);

    if (result.affectedRows === 0) {
        throw new InternalServerError('Books like was not deleted. Please try again.');
    }

    return result;
};

module.exports = {
    createBooks,
    createBooksLike,
    deleteBooksLike,
    getAllBooks,
    getBookById,
    getBooksByAuthor,
    getBooksByCategory,
    getBooksReleasedInTheLastMonth
};