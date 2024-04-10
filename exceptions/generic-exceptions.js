const { StatusCodes } = require('http-status-codes');


class BadRequestError extends Error {
    constructor(message) {
        super(message || 'Bad request.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'BadRequestError';
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message || 'Unauthorized.');
        this.statusCode = StatusCodes.UNAUTHORIZED;
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message || 'Forbidden.');
        this.statusCode = StatusCodes.FORBIDDEN;
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message || 'Resource not found.');
        this.statusCode = StatusCodes.NOT_FOUND;
        this.name = 'NotFoundError';
    }
}

class InternalServerError extends Error {
    constructor(message) {
        super(message || 'Internal server error.');
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        this.name = 'InternalServerError';
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
};