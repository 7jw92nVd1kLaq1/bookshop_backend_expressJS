const express = require('express');
const router = express.Router();

const { 
    signIn,
    signOut,
    initiatePasswordResetProcess, 
    completePasswordResetProcess 
} = require('../controllers/auth-controller');
const { 
    allowAccessToLoggedInUser,
    denyAccessToLoggedInUser 
} = require('../middlewares/auth-middleware');

router.post('/login', denyAccessToLoggedInUser, signIn);
router.get('/logout', allowAccessToLoggedInUser, signOut);

router.post('/password-reset', denyAccessToLoggedInUser, initiatePasswordResetProcess);
router.put('/password-reset/:resetCode', denyAccessToLoggedInUser, completePasswordResetProcess);

module.exports = router;