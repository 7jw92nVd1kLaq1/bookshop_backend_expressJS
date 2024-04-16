const { StatusCodes } = require('http-status-codes');


const { BooksNotFoundError } = require('../exceptions/books-exceptions'); 
const { getAllBooks } = require('../services/books-service');
const { getAllCategories } = require('../services/categories-service');


const fetchAllCategories = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        return res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        next(error);
    }
};

const fetchBooksByCategory = async (req, res, next) => {
    const { id } = req.params;
    const { page, amount } = req.query;

    const queryOptions = {
        columns: [
            'books.id',
            'books.title',
            'books.description',
            'books.authors_id',
            'books.categories_id',
            'books.page_number',
            'books.isbn',
            'books.pub_date',
            'books.publishers',
            'books.form',
            'categories.name as category',
            'authors.name as author'
        ],
        joins: [
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
        ],
        wheres: [
            `books.categories_id = ?`
        ],
        limit: amount ? amount : null,
        offset: page ? (page - 1) * amount : null
    };

    try {
        const books = await getAllBooks(queryOptions, [id]);
        if (books.length === 0) {
            throw new BooksNotFoundError();
        }
        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchAllCategories,
    fetchBooksByCategory
};