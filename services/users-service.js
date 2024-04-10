const pool = require('../db');
const { 
    EmailDoesNotMeetRequirementsError, 
    NicknameContainsUnallowedCharactersError,
    PasswordDoesNotMeetRequirementsError,
    UserNotFoundError,
    UserAlreadyExistsError
} = require('../exceptions/users-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');

const { generateBcryptHash } = require('../utils/hash-utils');

const checkEmailRequirements = (email) => {
    const emailLength = email && email.length <= 320;
    const [username, domain] = email.split('@');
    const usernameLength = username.length <= 64;
    const domainLength = domain.length <= 255;

    if (!emailLength || !usernameLength || !domainLength) {
        return false;
    }

    return true;
};

const checkNicknameRequirements = (nickname) => {
    const nicknameLength = nickname && nickname.length <= 150;
    const hasUnallowedCharacters = /[^A-Za-z0-9\s_-]/.test(nickname);

    if (!nicknameLength || hasUnallowedCharacters) {
        return false;
    }

    return true;
};

const checkPasswordRequirements = (password) => {
    const passwordLength = password && password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasNonAlphas = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonAlphas || !passwordLength) {
        return false;
    }

    return true;
};

const createUser = async (connection, email, password, nickname) => {
    if (!checkEmailRequirements(email)) {
        throw new EmailDoesNotMeetRequirementsError();
    }

    if (!checkPasswordRequirements(password)) {
        throw new PasswordDoesNotMeetRequirementsError();
    }

    if (!checkNicknameRequirements(nickname)) {
        throw new NicknameContainsUnallowedCharactersError();
    }

    let user;
    try {
        user = await getUserByEmail(email);
    } catch (error) {
        if (!(error instanceof UserNotFoundError)) {
            throw error;
        }
        user = null;
    }

    if (user) {
        throw new UserAlreadyExistsError();
    }
    
    const passwordHash = await generateBcryptHash(password);
    const query = 'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)';
    const values = [email, passwordHash, nickname];
    let result;
    try {
        [result] = await connection.query(query, values);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.log(`DB error occurred in "createUser": ${error.message}`);
        throw new InternalServerError('Error occurred while creating user. Please try again.');
    }

    if (!result.insertId) {
        throw new InternalServerError('User was not created. Please try again.');
    }
    
    return {id: result.insertId, email, nickname};
};

const changeUserPassword = async (connection, user_id, password) => {
    if (!checkPasswordRequirements(password)) {
        throw new PasswordDoesNotMeetRequirementsError();
    }

    await getUserById(user_id);
    const passwordHash = await generateBcryptHash(password);
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const values = [passwordHash, user_id];

    let result;
    try {
        [result] = await connection.query(query, values);
    } catch (error) {
        console.log(`DB error occurred in "changeUserPasswordWithEmail": ${error.message}`);
        throw new InternalServerError('Error occurred while changing user password. Please try again.');
    }

    if (!result.affectedRows) {
        throw new InternalServerError('User password was not changed. Please try again.');
    }

    return true;
};

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';

    let user;
    try {
        const [results] = await pool.query(query, [email]);
        user = results[0];
    }
    catch (error) {
        console.log(`DB error occurred in "getUserByEmail": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching user. Please try again.');
    }

    if (!user) {
        throw new UserNotFoundError();
    }

    return user;
};

const getUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';

    let user;
    try {
        const [results] = await pool.query(query, [id]);
        user = results[0];
    }
    catch (error) {
        console.log(`DB error occurred in "getUserById": ${error.message}`);
        throw error;
    }

    if (!user) {
        throw new UserNotFoundError();
    }

    return user;
}

module.exports = {
    changeUserPassword,
    createUser,
    getUserByEmail,
    getUserById
};