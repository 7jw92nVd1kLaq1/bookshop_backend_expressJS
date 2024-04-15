const { verifyToken } = require('../services/auth-service');
const { StatusCodes } = require('http-status-codes');


const adminOnly = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'Forbidden'
        });
    }

    try {
        const decodedToken = verifyToken(token);
        if (decodedToken.weight > 10) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Forbidden'
            });
        }
        return next();
    } catch (error) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'Forbidden'
        });
    }
}

const allowAccessToLoggedInUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'Forbidden'
        });
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
        return next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'Forbidden'
        });
    }
};

const denyAccessToLoggedInUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next();
    }

    try {
        verifyToken(token);
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'Forbidden'
        });
    } catch (error) {
        res.clearCookie('token');
        return next();
    }
};

const allowAccessToEveryone = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next();
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
    } catch (error) {
        res.clearCookie('token');
    }

    return next();
};

module.exports = {
    adminOnly,
    allowAccessToEveryone,
    allowAccessToLoggedInUser,
    denyAccessToLoggedInUser
};