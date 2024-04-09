const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { name, description } = req.body;
    res.send(`Author created: name=${name}, description=${description}`);
});

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Authors: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.get('/:id', (req, res) => {
    const viewMode = req.get('X-View-Mode');
    const { id } = req.params;
    res.send(`Author: id=${id}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Author deleted: id=${id}`);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    res.send(`Author updated: id=${id}, name=${name}, description=${description}`);
});

router.get('/:id/books', (req, res) => {
    const { page, amount, sortBy, sortOrder } = req.query;
    const { id } = req.params;
    res.send(`Author books: id=${id}, page=${page}, amount=${amount}, sortBy=${sortBy}, sortOrder=${sortOrder}`);
});

router.get('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Author likes: id=${id}`);
});

router.post('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Author like added: id=${id}`);
});

router.delete('/:id/likes', (req, res) => {
    const { id } = req.params;
    res.send(`Author like deleted: id=${id}`);
});

router.get('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`Author images: id=${id}`);
});

router.post('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`Author image uploaded: id=${id}`);
});

router.delete('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`Author image deleted: id=${id}, imageId=${imageId}`);
});

router.get('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`Author image: id=${id}, imageId=${imageId}`);
});

module.exports = router;