const { StatusCodes } = require('http-status-codes');

const {
    getAllBooks,
    getBookById
} = require('../services/books-service');


const fetchAllBooks = async (req, res, next) => {
    const { page, amount } = req.query;
    try {
        const books = await getAllBooks({
            limit: amount ? amount : null,
            offset: page ? (page - 1) * amount : null
        });
        return res.status(StatusCodes.OK).json(books);
    } catch (error) {
        next(error);
    }
};

const fetchBookById = async (req, res, next) => {
    let { id } = req.params;

    try {
        const book = await getBookById(id);
        return res.status(StatusCodes.OK).json(book);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchAllBooks,
    fetchBookById
};