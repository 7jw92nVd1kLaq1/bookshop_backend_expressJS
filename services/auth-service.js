const { sign, verify } = require('jsonwebtoken');

const { secret } = require('../config');
const pool = require('../db');

const { PasswordResetCodeNotFoundOrExpiredError } = require('../exceptions/auth-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');

const { formatDateToYYYYMMDDHHMMSS } = require('../utils/datetime-utils');
const { generateRandomHash } = require('../utils/hash-utils');


const createToken = (payload, options) => {
    return sign(payload, secret, options);
};

const verifyToken = (token) => {
    return verify(token, secret);
};

const createUserToken = (user) => {
    if (!user) {
        throw new Error('User is required');
    }
    if (!user.sub) {
        throw new Error('User ID is required');
    }
    if (!user.email) {
        throw new Error('User email is required');
    }
    return createToken(
        user,
        { expiresIn: '1h', issuer: 'bookstore-api'}
    );
};

const markPasswordResetCodeAsUsed = async (connection, code) => {
    if (typeof code !== 'string') {
        throw new Error('Code must be a string');
    }
    const query = 'UPDATE passwd_resets SET used = 1 WHERE url_code = ?';
    const values = [code];

    let result;
    try {
        [result] = await connection.query(query, values);
    }
    catch (error) {
        console.log(`DB error occurred in "markPasswordResetCodeAsUsed": ${error.message}`);
        throw new InternalServerError('Error occurred while marking password reset code as used. Please try again.');
    }

    if (!result.affectedRows) {
        throw new InternalServerError('Password reset code was not marked as used. Please try again.');
    }

    return true;
};

const validatePasswordResetCode = async (code) => {
    const rightNow = Date.now();
    const now = formatDateToYYYYMMDDHHMMSS(rightNow);

    const query = 'SELECT * FROM passwd_resets WHERE url_code = ? AND expired_at > ? AND used = 0';
    const values = [code, now];

    let result;
    try {
        [result] = await pool.query(query, values);
    } catch (error) {
        console.log(`DB error occurred in "validatePasswordResetCode": ${error.message}`);
        throw new InternalServerError('Error occurred while validating password reset code. Please try again.');
    }

    if (!result.length) {
        throw new PasswordResetCodeNotFoundOrExpiredError();
    }

    return result[0];
}

const generatePasswordResetCode = async (connection, user_id) => {
    const code = generateRandomHash();
    const rightNow = Date.now();
    const createdAt = formatDateToYYYYMMDDHHMMSS(rightNow);
    const expiredAt = formatDateToYYYYMMDDHHMMSS(rightNow + 3600000);

    const query = 'INSERT INTO passwd_resets (users_id, url_code, created_at, expired_at) VALUES (?, ?, ?, ?)';
    const values = [user_id, code, createdAt, expiredAt];

    let result;
    try {
        [result] = await connection.query(query, values);
    } catch (error) {
        console.log(`DB error occurred in "generatePasswordResetCode": ${error.message}`);
        throw new InternalServerError('Error occurred while generating password reset code. Please try again.');
    }

    if (!result.insertId) {
        throw new InternalServerError('Password reset code was not generated. Please try again.');
    }

    return code;
}

module.exports = {
    createToken,
    verifyToken,
    createUserToken,
    generatePasswordResetCode,
    validatePasswordResetCode,
    markPasswordResetCodeAsUsed
};