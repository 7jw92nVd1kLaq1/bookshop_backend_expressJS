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

const { Roles } = require('../models/auth-models');
const { Users, UsersRoles } = require('../models/users-models');


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

const createUser = async (transaction, email, password, nickname) => {
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
    
    const passwordHash = await generateBcryptHash(password);
    user = Users.build({
        email,
        password: passwordHash,
        nickname
    });

    try {
        await user.save({transaction});
    } catch (error) {
        console.log(`DB error occurred in "createUser": ${error.message}`);
        throw new InternalServerError('Error occurred while creating user. Please try again.');
    }

    await user.reload({transaction});

    // Assigning user role
    const role = await Roles.findOne({
        where: {
            name: 'user'
        },
        attributes: ['id', 'name', 'weight']
    });
    const usersRoles = UsersRoles.build({
        usersId: user.id,
        rolesId: role.id,
    });

    try {
        await usersRoles.save({transaction});
        return {
            sub: user.id, 
            email, 
            nickname, 
            role: role.name, 
            role_weight: role.weight
        };
    } catch (error) {
        console.log(`DB error occurred in "createUser": ${error.message}`);
        throw new InternalServerError('Error occurred while creating user. Please try again.');
    }
};

const changeUserPassword = async (connection, user_id, password) => {
    if (!checkPasswordRequirements(password)) {
        throw new PasswordDoesNotMeetRequirementsError();
    }

    // Check if user exists, if not, throw an error
    await getUserById(user_id, {columns: ['id']});

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
    // Building a query string
    const builder = new SelectQueryBuilder();
    builder.select(columns).from('users');
    joins.forEach(j => builder.join(j.table, j.on));
    orderBy.forEach(o => builder.orderBy(o.column, o.order));
    if (limit) builder.limit(limit);

    const query = builder.build();
    const users = await query.run();

    if (!users.length) {
        throw new UserNotFoundError();
    }

    return users;
};

const getUserByEmail = async (email, options = {}) => {
    const {columns = ['*'], joins = []} = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('users').where('email = ?');
    joins.forEach(j => builder.join(j.table, j.on));

    const query = builder.build();
    const users = await query.run([email]);
    const user = users[0];

    if (!user) {
        throw new UserNotFoundError();
    }

    return user;
};

const getUserById = async (id, options = {}) => {
    const {columns = ['*'], joins = []} = options;

    const builder = new SelectQueryBuilder();
    builder.select(columns).from('users').where('id = ?');
    joins.forEach(j => builder.join(j.table, j.on));

    const query = builder.build();
    const users = await query.run([id]);
    const user = users[0];

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