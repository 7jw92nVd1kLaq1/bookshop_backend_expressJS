const { StatusCodes } = require('http-status-codes');


const throwError = (error, req, res, next) => {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
        message: error.message || 'Internal server error'
    });
}

module.exports = throwError;