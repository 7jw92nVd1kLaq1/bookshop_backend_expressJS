const { StatusCodes } = require('http-status-codes');


class EmailTooLongError extends Error {
    constructor() {
        super('Email is too long. Maximum length is 320 characters.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'EmailTooLongError';
    }
}

class EmailDoesNotMeetRequirementsError extends Error {
    constructor() {
        super('Email does not meet requirements. It must be at most 320 characters long, contain a username of at most 64 characters, and a domain of at most 255 characters.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'EmailDoesNotMeetRequirementsError';
    }
}

class PasswordsDoNotMatchError extends Error {
    constructor() {
        super('Passwords do not match.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'PasswordsDoNotMatchError';
    }
}

class PasswordContainsUsernameError extends Error {
    constructor() {
        super('Password cannot contain username.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'PasswordContainsUsernameError';
    }
}

class PasswordContainsNicknameError extends Error {
    constructor() {
        super('Password cannot contain nickname.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'PasswordContainsNicknameError';
    }
}

class PasswordDoesNotMeetRequirementsError extends Error {
    constructor() {
        super('Password does not meet requirements. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'PasswordDoesNotMeetRequirementsError';
    }
}

class NicknameTooLongError extends Error {
    constructor() {
        super('Nickname is too long. Maximum length is 150 characters.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'NicknameTooLongError';
    }
}

class NicknameContainsUnallowedCharactersError extends Error {
    constructor() {
        super('Nickname contains unallowed characters. Only allowed characters are letters, numbers, underscores, and whitespaces.');
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'NicknameContainsUnallowedCharactersError';
    }
}

class UserNotFoundError extends Error {
    constructor(message) {
        super(message || 'User not found.');
        this.statusCode = StatusCodes.NOT_FOUND;
        this.name = 'UserNotFoundError';
    }
}

class UserAlreadyExistsError extends Error {
    constructor(message) {
        super('User with this email already exists.' || message);
        this.statusCode = StatusCodes.BAD_REQUEST;
        this.name = 'UserAlreadyExistsError';
    }
}

module.exports = {
    PasswordContainsUsernameError,
    PasswordContainsNicknameError,
    PasswordsDoNotMatchError,
    PasswordDoesNotMeetRequirementsError,
    NicknameContainsUnallowedCharactersError,
    NicknameTooLongError,
    EmailTooLongError,
    EmailDoesNotMeetRequirementsError,
    UserNotFoundError,
    UserAlreadyExistsError
};