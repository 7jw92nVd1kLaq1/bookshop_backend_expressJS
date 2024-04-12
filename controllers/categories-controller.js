const { StatusCodes } = require('http-status-codes');

const { getBooksByCategory } = require('../services/books-service');
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

    try {
        const books = await getBooksByCategory(
            id, 
            {
                joins: [
                    {
                        table: 'categories',
                        on: 'categories.id = books.categories_id'
                    }
                ],
                limit: amount
            }
        );
        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchAllCategories,
    fetchBooksByCategory
};