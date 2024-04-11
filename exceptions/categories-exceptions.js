const { NotFoundError } = require('./generic-exceptions');

class CategoryNotFoundError extends NotFoundError {
  constructor() {
    super('Category not found.');
    this.name = 'CategoryNotFoundException';
  }
}

module.exports = {
    CategoryNotFoundError
};