const { NotFoundError } = require('./generic-exceptions');

class BooksNotFoundError extends NotFoundError {
    constructor() {
        super('No books found.');
        this.name = 'BooksNotFoundError';
    }
}

module.exports = {
    BooksNotFoundError
};