const { StatusCodes } = require('http-status-codes');

const {
    getAllBooks,
    getBookById
} = require('../services/books-service');


const fetchAllBooks = async (req, res) => {
    try {
        const books = await getAllBooks();
        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }
};

const fetchBookById = async (req, res) => {
    let { id } = req.params;
    id = parseInt(id);

    try {
        const book = await getBookById(id);
        return res.status(StatusCodes.OK).json(book);
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    }
};

module.exports = {
    fetchAllBooks,
    fetchBookById
};