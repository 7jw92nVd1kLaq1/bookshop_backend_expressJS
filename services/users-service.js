const { promisePool } = require('../db');
const { 
    EmailDoesNotMeetRequirementsError, 
    NicknameContainsUnallowedCharactersError,
    PasswordDoesNotMeetRequirementsError,
    UserNotFoundError,
    UserAlreadyExistsError
} = require('../exceptions/users-exceptions');
const { InternalServerError } = require('../exceptions/generic-exceptions');
const { generateBcryptHash } = require('../utils/hash-utils');
const { 
    SelectQueryBuilder,
} = require('../utils/sql-utils');


const assignUserRoles = async (connection, user_id, roles) => {
    const query = 'INSERT INTO users_roles (user_id, roles_id) VALUES ?';
    const values = roles.map(role => [user_id, role]);

    let result;
    try {
        [result] = await connection.query(query, [values]);
    } catch (error) {
        console.log(`DB error occurred in "assignUserRoles": ${error.message}`);
        throw new InternalServerError('Error occurred while assigning user roles. Please try again.');
    }

    if (!result.affectedRows) {
        throw new InternalServerError('User roles were not assigned. Please try again.');
    }

    return true;
};

const getAvailableRoles = async () => {
    const query = 'SELECT id, name FROM roles';

    let roles;
    try {
        const [rows] = await promisePool.query(query);
        roles = rows;
    } catch (error) {
        console.log(`DB error occurred in "checkAvailableRoles": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching available roles. Please try again.');
    }

    return roles;
};


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

    // Checking if user already exists
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

    const roles = await getAvailableRoles();
    const userRole = roles.find(role => role.name === 'User');
    
    const passwordHash = await generateBcryptHash(password);

    // Inserting user into the database
    const userGenerateQuery = 'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)';
    const userValues = [email, passwordHash, nickname];

    let usersResult;
    try {
        [usersResult] = await connection.query(userGenerateQuery, userValues);
        if (!usersResult.insertId) {
            throw new Error();
        }
    } catch (error) {
        console.log(`DB error occurred in "createUser": ${error.message}`);
        throw new InternalServerError('Error occurred while creating user. Please try again.');
    }

    // Assigning user role
    const roleGenerateQuery = 'INSERT INTO users_roles (users_id, roles_id) VALUES (?, ?)';
    const roleValues = [usersResult.insertId, userRole.id];

    let rolesResult;
    try {
        [rolesResult] = await connection.query(roleGenerateQuery, roleValues);
        if (!rolesResult.insertId) {
            throw new Error();
        }
    } catch (error) {
        console.log(`DB error occurred in "createUser": ${error.message}`);
        throw new InternalServerError('Error occurred while creating user. Please try again.');
    }

    return {sub: usersResult.insertId, email, nickname, role: userRole.name, role_weight: userRole.weight};
};

const changeUserPassword = async (connection, user_id, password) => {
    if (!checkPasswordRequirements(password)) {
        throw new PasswordDoesNotMeetRequirementsError();
    }

    await getUserById(user_id, ['id']);
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

const getAllUsers = async ({columns = ['*'], joins = [], limit = null, orderBy = []}) => {
    let users;

    // Building a query string
    const builder = new SelectQueryBuilder();
    builder.select(columns).from('users');
    joins.forEach(j => builder.join(j.table, j.on));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    if (limit) builder.limit(limit);
    const query = builder.build();

    try {
        const [results] = await promisePool.query(query);
        users = results;
    }
    catch (error) {
        console.log(`DB error occurred in "getAllUsers": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching users. Please try again.');
    }

    if (!users.length) {
        throw new UserNotFoundError();
    }

    return users;
};

const getUserByEmail = async (email, options = {columns: ['*'], joins : []}) => {
    let user;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('users').where('email = ?');
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [results] = await promisePool.query(query, [email]);
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

const getUserById = async (id, options = {columns: ['*'], joins : []}) => {
    let user;

    const builder = new SelectQueryBuilder();
    builder.select(options.columns).from('users').where('id = ?');
    options.joins.forEach(j => builder.join(j.table, j.on));
    const query = builder.build();

    try {
        const [results] = await promisePool.query(query, [id]);
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
    getAllUsers,
    getUserByEmail,
    getUserById
};