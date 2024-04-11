const { StatusCodes } = require('http-status-codes');

const { getBooksByCategory } = require('../services/books-service');
const { getAllCategories } = require('../services/categories-service');


const fetchAllCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        return res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }
};

const fetchBooksByCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const books = await getBooksByCategory(id);
        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    }
};

module.exports = {
    fetchAllCategories,
    fetchBooksByCategory
};