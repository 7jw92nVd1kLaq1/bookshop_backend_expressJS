const { param, query, body } = require('express-validator');
const express = require('express');
const router = express.Router();

const {
    addOrder,
    fetchOrder,
    fetchAllOrders
} = require('../controllers/orders-controller');

const { validate } = require('../middlewares/validate-middleware');
const { allowAccessToLoggedInUser } = require('../middlewares/auth-middleware');
const { all } = require('./carts');

router.post(
    '/',
    [
        allowAccessToLoggedInUser,
        body('carts_id').isInt().toInt(),
        body('books').isArray().notEmpty(),
        body('address').isObject().notEmpty(),
        validate
    ],
    addOrder
);

router.get(
    '/',
    [
        allowAccessToLoggedInUser,
        query('page').optional().isInt().toInt(),
        query('amount').optional().isInt().toInt(),
        validate
    ],
    fetchAllOrders
);

router.get(
    '/:id',
    [
        allowAccessToLoggedInUser,
        param('id').isInt().toInt(),
        validate
    ],
    fetchOrder
);

module.exports = router;