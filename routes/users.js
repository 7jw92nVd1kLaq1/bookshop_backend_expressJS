const express = require('express');
const router = express.Router();

const { signUp } = require('../controllers/auth-controller');

router.get('/', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    res.send(`Users: sortBy=${sortBy}, sortOrder=${sortOrder}, page=${page}, amount=${amount}`);
});

router.post('/', signUp);

router.get('/:id', (req, res) => {
    const viewMode = req.get('X-View-Mode');
    const { id } = req.params;
    res.send(`User: id=${id}`);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    res.send(`User updated: id=${id}, name=${name}, email=${email}, password=${password}`);
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`User deleted: id=${id}`);
});

router.get('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`User images: id=${id}`);
});

router.post('/:id/images', (req, res) => {
    const { id } = req.params;
    res.send(`User image uploaded: id=${id}`);
});

router.delete('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`User image deleted: id=${id}, imageId=${imageId}`);
});

router.get('/:id/images/:imageId', (req, res) => {
    const { id, imageId } = req.params;
    res.send(`User image: id=${id}, imageId=${imageId}`);
});

router.get('/:id/liked-books', (req, res) => {
    const { id } = req.params;
    res.send(`User liked books: id=${id}`);
});

router.get('/:id/addresses', (req, res) => {
    const { id } = req.params;
    res.send(`User addresses: id=${id}`);
});

router.post('/:id/addresses', (req, res) => {
    const { id } = req.params;
    const { address } = req.body;
    res.send(`User address added: id=${id}, address=${address}`);
});

router.delete('/:id/addresses/:addressId', (req, res) => {
    const { id, addressId } = req.params;
    res.send(`User address deleted: id=${id}, addressId=${addressId}`);
});

router.get('/:id/addresses/:addressId', (req, res) => {
    const { id, addressId } = req.params;
    res.send(`User address: id=${id}, addressId=${addressId}`);
});

router.put('/:id/addresses/:addressId', (req, res) => {
    const { id, addressId } = req.params;
    const { address } = req.body;
    res.send(`User address updated: id=${id}, addressId=${addressId}, address=${address}`);
});

router.get('/:id/reviews', (req, res) => {
    const { keywords, sortBy, sortOrder, page, amount } = req.query;
    const { id } = req.params;
    res.send(`User reviews: id=${id}`);
});

module.exports = router;