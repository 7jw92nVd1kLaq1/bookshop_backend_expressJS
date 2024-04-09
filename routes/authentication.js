const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    res.send(`User logged in: email=${email}, password=${password}`);
});

router.get('/logout', (req, res) => {
    res.send('User logged out');
});

module.exports = router;