const { param } = require('express-validator');
const express = require('express');
const router = express.Router();

const {
    fetchBooksByCategory
} = require('../controllers/categories-controller');
const { validate } = require('../middlewares/validate-middleware');


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

router.get(
    '/:id/books',
    [
        param('id').isInt().toInt(),
        validate
    ],
    fetchBooksByCategory
);

module.exports = router;