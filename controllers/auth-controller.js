const { StatusCodes } = require('http-status-codes');

const { sequelize } = require('../db');
const {
    LoginFailedError
} = require('../exceptions/auth-exceptions');
const {
    UserNotFoundError
} = require('../exceptions/users-exceptions');
const { 
    changeUserPassword,
    createUser, 
    getUserByEmail,
} = require('../services/users-service');
const { 
    createUserToken, 
    generatePasswordResetCode,
    validatePasswordResetCode,
    markPasswordResetCodeAsUsed,
} = require('../services/auth-service');
const { comparePlaintextToBcryptHash } = require('../utils/hash-utils');


const signUp = async (req, res, next) => {
    const { nickname, email, password } = req.body;
    if (!nickname || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Nickname, email, and password are required'
        });
    }

    const transaction = await sequelize.transaction();

    try {
        const user = await createUser(transaction, email, password, nickname);
        await transaction.commit();

        const token = createUserToken(user);
        res.cookie('token', token, {
            httpOnly: true
        });

        return res.status(StatusCodes.CREATED).json({
            message: 'User created'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Email and password are required'
        });
    }

    try {
        // Sequelize query options for retrieving user data
        const queryOptions = {
            attributes: [
                ['id', 'sub'], 
                'email',
                'password', 
                'nickname'
            ],
            include: [
                {
                    association: 'roles',
                    attributes: ['name', 'weight'],
                    order: [
                        ['weight', 'ASC']
                    ]
                }
            ],
        };

        let user = await getUserByEmail(email, queryOptions);
        if (user === null) {
            throw new LoginFailedError();
        }

        const isPasswordValid = await comparePlaintextToBcryptHash(password, user.get('password'));
        if (!isPasswordValid) {
            throw new LoginFailedError();
        }

        user = { 
            sub: user.get('sub'), 
            email: user.get('email'), 
            nickname: user.get('nickname'), 
            role: user.get('roles')[0].name, 
            weight: user.get('roles')[0].weight
        };

        const token = createUserToken(user);
        res.cookie('token', token, {
            httpOnly: true
        });

        return res.status(StatusCodes.OK).json({
            message: `Welcome back, ${user.nickname}!`
        });
    } catch (error) {
        if (error.name && error.name === 'UserNotFoundError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Invalid email or password'
            });
        }
        next(error);
    }
};

const signOut = (req, res) => {
    res.clearCookie('token');
    return res.status(StatusCodes.OK).json({
        message: 'User logged out'
    });
};

const initiatePasswordResetProcess = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Email is required'
        });
    }

    let user; 
    try {
        user = await getUserByEmail(email, {
            attributes: ['id']        
        });
        if (user === null) {
            throw new UserNotFoundError();
        }
    } catch (error) {
        if (error.name && error.name === 'UserNotFoundError') {
            return res.status(StatusCodes.CREATED).json({
                message: 'Password reset code sent to your email'
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Internal server error'
        });
    }

    const transaction = await sequelize.transaction();
    try {
        await generatePasswordResetCode(user.id, transaction);
        await transaction.commit();
        return res.status(StatusCodes.CREATED).json({
            message: 'Password reset code sent to your email'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const completePasswordResetProcess = async (req, res, next) => {
    const { resetCode } = req.params;
    const { password, confirmPassword } = req.body;

    if (!resetCode) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Reset code is required'
        });
    }

    if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Password and confirm password are required'
        });
    }

    if (password !== confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Password and confirm password do not match'
        });
    }

    const transaction = await sequelize.transaction();

    try {
        const code = await validatePasswordResetCode(resetCode);
        await changeUserPassword(transaction, code.users_id, password);
        await markPasswordResetCodeAsUsed(transaction, resetCode);

        await transaction.commit();
        return res.status(StatusCodes.OK).json({
            message: 'Password reset successful'
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    signUp,
    signIn,
    signOut,
    initiatePasswordResetProcess,
    completePasswordResetProcess,
};