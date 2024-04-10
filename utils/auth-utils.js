const bcrypt = require('bcrypt');
const { saltRounds } = require('../config');

const generatePasswordHash = async (password) => {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
};

const comparePassword = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
};

module.exports = {
    generatePasswordHash,
    comparePassword
};