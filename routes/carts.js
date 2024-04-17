const express = require('express');
const router = express.Router();
const { param, query, body } = require('express-validator');

const { validate } = require('../middlewares/validate-middleware');
const { 
    adminOnly,
    allowAccessToLoggedInUser
} = require('../middlewares/auth-middleware');
const {
    addCart,
    addCartItem,
    deleteCartItem,
    editCartItem,
    fetchAllCarts,
    fetchCart,
    fetchSelectedItemsFromCart
} = require('../controllers/carts-controller');


router.post(
    '/',
    [
        allowAccessToLoggedInUser,
        body('name').isString().notEmpty(),
        body('description').isString().notEmpty(),
        validate
    ],
    addCart
);
router.get(
    '/', 
    adminOnly,
    fetchAllCarts
);

router.get(
    '/:cartsId', 
    [
        allowAccessToLoggedInUser,
        param('cartsId').isInt().toInt(),
        validate
    ],
    fetchCart
);
router.delete(
    '/:cartsId', 
    allowAccessToLoggedInUser,
    (req, res) => {
        const { cartsId } = req.params;
        res.send(`Cart deleted: id=${cartsId}`);
    }
);
router.put(
    '/:cartsId', 
    allowAccessToLoggedInUser,
    (req, res) => {
        const { cartsId } = req.params;
        const { name, description } = req.body;
        res.send(`Cart updated: id=${cartsId}, name=${name}, description=${description}`);
    }
);


router.post(
    '/:cartsId/items',
    [
        allowAccessToLoggedInUser,
        param('cartsId').isInt().toInt(),
        body('booksId').isInt().toInt(),
        body('quantity').isInt().toInt(),
        validate
    ],
    addCartItem
);

router.delete(
    '/:cartsId/items/:itemsId', 
    [
        allowAccessToLoggedInUser,
        param('booksId').isInt().toInt(),
        param('cartsId').isInt().toInt(),
        validate
    ],
    deleteCartItem
);
router.put(
    '/:cartsId/items/:booksId', 
    [
        allowAccessToLoggedInUser,
        param('booksId').isInt().toInt(),
        param('cartsId').isInt().toInt(),
        body('quantity').isInt().toInt(),
        validate
    ],
    editCartItem
);
router.get(
    '/:cartsId/items',
    [
        allowAccessToLoggedInUser,
        param('cartsId').isInt().toInt(),
        body('booksIds').isArray().toInt(),
        validate
    ],
    fetchSelectedItemsFromCart
)

module.exports = router;