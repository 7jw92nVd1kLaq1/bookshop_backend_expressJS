const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
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
    res.send(`Book created: title=${title}, description=${description}, authorId=${authorId}, categoryId=${categoryId}, ISBN=${ISBN}, publicationDate=${publicationDate}, publisher=${publisher}, price=${price}, currency=${currency}, pages=${pages}, format=${format}, edition=${edition}, language=${language}`);
});

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Books: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.get('/:id', (req, res) => {
    const viewMode = req.get('X-View-Mode');
    const { id } = req.params;
    res.send(`Book: id=${id}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Book deleted: id=${id}`);
});

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

router.get('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Book likes: id=${id}`);
});

router.post('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Book like added: id=${id}`);
}); 

router.delete('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Book like deleted: id=${id}`);
});

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