class PasswordResetCodeNotFoundOrExpiredError extends Error {
  constructor() {
    super('Password reset code not found or expired');
    this.statusCode = 404;
    this.name = 'PasswordResetCodeNotFoundOrExpired';
  }
}

module.exports = {
    PasswordResetCodeNotFoundOrExpiredError
};