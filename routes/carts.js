const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { name, description } = req.body;
    res.send(`Cart created: name=${name}, description=${description}`);
});

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Carts: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Cart: id=${id}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Cart deleted: id=${id}`);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    res.send(`Cart updated: id=${id}, name=${name}, description=${description}`);
});

router.get('/:id/items', (req, res) => {
    const { id } = req.params;
    res.send(`Cart items: id=${id}`);
});

router.post('/:id/items', (req, res) => {
    const { id } = req.params;
    const { itemId, quantity } = req.body;
    res.send(`Cart item added: id=${id}, itemId=${itemId}, quantity=${quantity}`);
});

router.delete('/:id/items/:itemId', (req, res) => {
    const { id, itemId } = req.params;
    res.send(`Cart item deleted: id=${id}, itemId=${itemId}`);
});

router.get('/:id/items/:itemId', (req, res) => {
    const { id, itemId } = req.params;
    res.send(`Cart item: id=${id}, itemId=${itemId}`);
});

router.put('/:id/items/:itemId', (req, res) => {
    const { id, itemId } = req.params;
    const { quantity } = req.body;
    res.send(`Cart item updated: id=${id}, itemId=${itemId}, quantity=${quantity}`)
});

module.exports = router;