class ForbiddenError extends Error {
  constructor() {
    super('Forbidden');
    this.statusCode = 403;
    this.name = 'Forbidden';
  }
}

class PasswordResetCodeNotFoundOrExpiredError extends Error {
  constructor() {
    super('Password reset code not found or expired');
    this.statusCode = 404;
    this.name = 'PasswordResetCodeNotFoundOrExpired';
  }
}

class TokenNotProvidedError extends Error {
  constructor(message) {
    super(message || 'Token not provided');
    this.statusCode = 401;
    this.name = 'TokenNotProvided';
  }
}

class LoginFailedError extends Error {
  constructor() {
    super('Invalid email or password');
    this.statusCode = 401;
    this.name = 'LoginFailed';
  }
}

module.exports = {
  ForbiddenError,
  LoginFailedError,
  PasswordResetCodeNotFoundOrExpiredError,
  TokenNotProvidedError,
};