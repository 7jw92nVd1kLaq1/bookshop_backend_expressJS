class InvalidColumnError extends Error {  
  constructor(message = 'Invalid column name') {
    super(message);
    this.statusCode = 500;
    this.name = 'NotStringColumnException';
  }
}

module.exports = {
  InvalidColumnError
}; 