const { sign, verify } = require('jsonwebtoken');
const { Op } = require("sequelize");

const { secret } = require('../config');

const { PasswordResetCodeNotFoundOrExpiredError } = require('../exceptions/auth-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');

const { formatDateToYYYYMMDDHHMMSS } = require('../utils/datetime-utils');
const { generateRandomHash } = require('../utils/hash-utils');
const { SelectQueryBuilder } = require('../utils/sql-utils');
const { PasswdResets } = require('../models/auth-models');


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

    const passwdResetsList = await PasswdResets.findAll({
        where: {
            urlCode: code,
            used: false,
            expiredAt: {
                [Op.gt]: rightNow
            }
        }
    });

    if (passwdResetsList.length === 0) {
        throw new PasswordResetCodeNotFoundOrExpiredError();
    }

    return passwdResetsList[0];
}

const generatePasswordResetCode = async (user_id, transaction = null) => {
    let passwdReset;
    const createOptions = transaction ? { transaction } : {};
    if (user_id == null) {
        throw new Error('User ID is required');
    }

    try {
        passwdReset = await PasswdResets.create({
            usersId: user_id,
            urlCode: generateRandomHash(32),
        }, createOptions);
    }
    catch (error) {
        console.log(`DB error occurred in "generatePasswordResetCode": ${error.message}`);
        throw new InternalServerError('Error occurred while generating password reset code. Please try again.');
    }

    return passwdReset.urlCode;
};

module.exports = {
    createToken,
    verifyToken,
    createUserToken,
    generatePasswordResetCode,
    validatePasswordResetCode,
    markPasswordResetCodeAsUsed
};