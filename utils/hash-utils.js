const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { saltRounds } = require('../config');

const generatePasswordResetHash = () => {
    return crypto.randomBytes(32).toString('hex');
};

const generateBcryptHash = async (plaintext) => {
    const hash = await bcrypt.hash(plaintext, saltRounds);
    return hash;
};

const comparePlaintextToBcryptHash = async (plaintext, hash) => {
    const match = await bcrypt.compare(plaintext, hash);
    return match;
};

module.exports = {
    generateBcryptHash,
    generatePasswordResetHash,
    comparePlaintextToBcryptHash
};