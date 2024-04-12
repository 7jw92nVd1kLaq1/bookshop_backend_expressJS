const { getBooksByAuthor } = require('../services/books-service');

const fetchBooksByAuthor = async (req, res, next) => {
    const { id } = req.params;

    try {
        const books = await getBooksByAuthor(id);
        return res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchBooksByAuthor
};