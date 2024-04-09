const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { name, description } = req.body;
    res.send(`Category created: name=${name}, description=${description}`);
});

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Categories: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.get('/:id', (req, res) => {
    const viewMode = req.get('X-View-Mode');
    const { id } = req.params;
    res.send(`Category: id=${id}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Category deleted: id=${id}`);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    res.send(`Category updated: id=${id}, name=${name}, description=${description}`);
});

router.get('/:id/books', (req, res) => {
    const { keywords, page, amount, sortBy, sortOrder } = req.query;
    const { id } = req.params;
    res.send(`Category books: id=${id}, page=${page}, amount=${amount}, sortBy=${sortBy}, sortOrder=${sortOrder}`);
});

module.exports = router;