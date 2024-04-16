const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');

const {
    addBooks,
    likeBook,
    unlikeBook,
    fetchAllBooks,
    fetchBooksLikes,
    fetchBookById,
    fetchBooksByRecent
} = require('../controllers/books-controller');
const { 
    adminOnly,
    allowAccessToEveryone,
    allowAccessToLoggedInUser
} = require('../middlewares/auth-middleware');
const { validate } = require('../middlewares/validate-middleware');


router.post(
    '/', 
    adminOnly,
    addBooks
);
router.get(
    '/', 
    [
        allowAccessToEveryone,
        query('page').optional().isInt().toInt(),
        query('amount').optional().isInt().toInt(),
    ],
    fetchAllBooks
);
router.get(
    '/recent', 
    [
        allowAccessToEveryone,
        query('page').optional().isInt().toInt(),
        query('amount').optional().isInt().toInt(),
        query('months').optional().isInt().toInt(),
        query('days').optional().isInt().toInt(),
    ],
    fetchBooksByRecent
);


router.get(
    '/:id', 
    [
        allowAccessToEveryone,
        param('id').isInt().toInt(),
        validate
    ],
    fetchBookById
);
router.delete(
    '/:id', 
    adminOnly,
    (req, res) => {
        const { id } = req.params;
        res.send(`Book deleted: id=${id}`);
    }
);
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        authorId,
        categoryId,
        ISBN,
        publicationDate,
        publisherId,
        price,
        currency,
        pages,
        format,
        edition,
        language,
    } = req.body;
    res.send(`Book updated: id=${id}, title=${title}, description=${description}, authorId=${authorId}, categoryId=${categoryId}, ISBN=${ISBN}, publicationDate=${publicationDate}, publisher=${publisher}, price=${price}, currency=${currency}, pages=${pages}, format=${format}, edition=${edition}, language=${language}`);
});


router.get(
    '/:id/likes', 
    [
        allowAccessToEveryone,
        param('id').isInt().toInt(),
        validate
    ],
    fetchBooksLikes
);
router.post(
    '/:id/likes', 
    [
        allowAccessToLoggedInUser,
        param('id').isInt().toInt(),
        validate
    ],
    likeBook
); 
router.delete(
    '/:id/likes', 
    [
        allowAccessToLoggedInUser,
        param('id').isInt().toInt(),
        validate
    ],
    unlikeBook
);


router.get('/:id/reviews', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    const { id } = req.params;
    res.send(`Book reviews: id=${id}, sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});
router.post('/:id/reviews', (req, res) => {
    const { id } = req.params;
    const { title, description, rating } = req.body;
    res.send(`Book review added: id=${id}, title=${title}, description=${description}, rating=${rating}`);
});
router.get('/:id/reviews/:reviewId', (req, res) => {
    const { id, reviewId } = req.params;
    res.send(`Book review: id=${id}, reviewId=${reviewId}`);
});
router.delete('/:id/reviews/:reviewId', (req, res) => {
    const { id, reviewId } = req.params;
    res.send(`Book review deleted: id=${id}, reviewId=${reviewId}`);
});
router.put('/:id/reviews/:reviewId', (req, res) => {
    const { id, reviewId } = req.params;
    const { title, description, rating } = req.body;
    res.send(`Book review updated: id=${id}, reviewId=${reviewId}, title=${title}, description=${description}, rating=${rating}`);
});
router.post('/:id/reviews/:reviewId/images', (req, res) => {
    const { id, reviewId, description } = req.params;
    res.send(`Book review image uploaded: id=${id}, reviewId=${reviewId}`);
});
router.delete('/:id/reviews/:reviewId/images/:imageId', (req, res) => {
    const { id, reviewId, imageId } = req.params;
    res.send(`Book review image deleted: id=${id}, reviewId=${reviewId}, imageId=${imageId}`);
});
router.get('/:id/reviews/:reviewId/images/:imageId', (req, res) => {
    const { id, reviewId, imageId } = req.params;
    res.send(`Book review image: id=${id}, reviewId=${reviewId}, imageId=${imageId}`);
});
router.put('/:id/reviews/:reviewId/images/:imageId', (req, res) => {
    const { id, reviewId, imageId } = req.params;
    const { description } = req.body;
    res.send(`Book review image updated: id=${id}, reviewId=${reviewId}, imageId=${imageId}, description=${description}`);
});
router.get('/:id/reviews/:reviewId/likes', (req, res) => {
    const { sortBy, sortOrder, page, amount } = req.query;
    const { id, reviewId } = req.params;
    res.send(`Book review likes: id=${id}, reviewId=${reviewId}`);
});
router.post('/:id/reviews/:reviewId/likes', (req, res) => {
    const { id, reviewId } = req.params;
    res.send(`Book review like added: id=${id}, reviewId=${reviewId}`);
});
router.delete('/:id/reviews/:reviewId/likes', (req, res) => {
    const { id, reviewId } = req.params;
    res.send(`Book review like deleted: id=${id}, reviewId=${reviewId}`);
});
router.get('/:id/reviews/:reviewId/comments', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    const { id, reviewId } = req.params;
    res.send(`Book review comments: id=${id}, reviewId=${reviewId}`);
});
router.post('/:id/reviews/:reviewId/comments', (req, res) => {
    const { id, reviewId } = req.params;
    const { description } = req.body;
    res.send(`Book review comment added: id=${id}, reviewId=${reviewId}, description=${description}`);
});
router.get('/:id/reviews/:reviewId/comments/:commentId', (req, res) => {
    const { id, reviewId, commentId } = req.params;
    res.send(`Book review comment: id=${id}, reviewId=${reviewId}, commentId=${commentId}`);
});
router.delete('/:id/reviews/:reviewId/comments/:commentId', (req, res) => {
    const { id, reviewId, commentId } = req.params;
    res.send(`Book review comment deleted: id=${id}, reviewId=${reviewId}, commentId=${commentId}`);
});
router.put('/:id/reviews/:reviewId/comments/:commentId', (req, res) => {
    const { id, reviewId, commentId } = req.params;
    const { description } = req.body;
    res.send(`Book review comment updated: id=${id}, reviewId=${reviewId}, commentId=${commentId}, description=${description}`);
});
router.get('/:id/reviews/:reviewId/comments/:commentId/likes', (req, res) => {
    const { sortBy, sortOrder, page, amount } = req.query;
    const { id, reviewId, commentId } = req.params;
    res.send(`Book review comment likes: id=${id}, reviewId=${reviewId}, commentId=${commentId}`);
});
router.post('/:id/reviews/:reviewId/comments/:commentId/likes', (req, res) => {
    const { id, reviewId, commentId } = req.params;
    res.send(`Book review comment like added: id=${id}, reviewId=${reviewId}, commentId=${commentId}`);
});
router.delete('/:id/reviews/:reviewId/comments/:commentId/likes', (req, res) => {
    const { id, reviewId, commentId } = req.params;
    res.send(`Book review comment like deleted: id=${id}, reviewId=${reviewId}, commentId=${commentId}`);
});


module.exports = router;