const { verifyToken } = require('../services/auth-service');

const { 
    ForbiddenError,
    TokenNotProvidedError 
} = require('../exceptions/auth-exceptions');


const adminOnly = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(new TokenNotProvidedError('Login required'));
    }

    try {
        const decodedToken = verifyToken(token);
        if (decodedToken.weight > 10) {
            return next(new ForbiddenError());
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

const allowAccessToLoggedInUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(new TokenNotProvidedError('Login required'));
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
        return next();
    } catch (error) {
        res.clearCookie('token');
        return next(error);
    }
};

const denyAccessToLoggedInUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next();
    }

    // if token is valid, throw an error
    try {
        verifyToken(token);
        return next(new ForbiddenError());
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