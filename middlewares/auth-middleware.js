const { verifyToken } = require('../services/auth-service');

const allowAccessToLoggedInUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
        return next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(403).json({
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
        const decodedToken = verifyToken(token);
        return res.status(403).json({
            message: 'Forbidden'
        });
    } catch (error) {
        res.clearCookie('token');
        return next();
    }
};

module.exports = {
    allowAccessToLoggedInUser,
    denyAccessToLoggedInUser
};