const { StatusCodes } = require('http-status-codes');

const { Authors } = require('../models/authors-models');
const { Categories } = require('../models/categories-models');

const { BooksNotFoundError } = require('../exceptions/books-exceptions'); 
const { getAllBooksSequelize } = require('../services/books-service');
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


    const queryOptionsSequelize = {
        attributes: {
            exclude: ['categories_id', 'authors_id', 'categoriesId', 'authorsId']
        },
        include: [
            {
                model: Categories,
                attributes: ['name', 'id'],
                required: true
            },
            {
                model: Authors,
                attributes: ['name', 'id'],
                required: true
            }
        ],
        where: {
            categories_id: id
        },
        limit: amount ? amount : null,
        offset: page ? (page - 1) * amount : null
    };

    try {
        const books = await getAllBooksSequelize(queryOptionsSequelize);
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