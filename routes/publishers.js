const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { name, description } = req.body;
    res.send(`Publisher created: name=${name}, description=${description}`);
});

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Publishers: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.get('/:id', (req, res) => {
    const viewMode = req.get('X-View-Mode');
    const { id } = req.params;
    res.send(`Publisher: id=${id}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Publisher deleted: id=${id}`);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    res.send(`Publisher updated: id=${id}, name=${name}, description=${description}`);
});

router.get('/:id/books', (req, res) => {
    const { page, amount, sortBy, sortOrder } = req.query;
    const { id } = req.params;
    res.send(`Publisher books: id=${id}, page=${page}, amount=${amount}, sortBy=${sortBy}, sortOrder=${sortOrder}`);
});

router.get('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`Publisher images: id=${id}`);
});

router.post('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`Publisher image uploaded: id=${id}`);
});

router.get('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`Publisher image: id=${id}, imageId=${imageId}`);
});

router.delete('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`Publisher image deleted: id=${id}, imageId=${imageId}`);
});

module.exports = router;