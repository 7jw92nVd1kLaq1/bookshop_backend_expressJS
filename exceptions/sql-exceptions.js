class KeywordDetectedError extends Error {
  constructor(message = 'Keyword found') {
    super(message);
    this.statusCode = 400;
    this.name = 'ForbiddenWordError';
  }
}

class InvalidColumnError extends Error {  
  constructor(message = 'Invalid column name') {
    super(message);
    this.statusCode = 500;
    this.name = 'NotStringColumnException';
  }
}


module.exports = {
  KeywordDetectedError,
  InvalidColumnError
}; 