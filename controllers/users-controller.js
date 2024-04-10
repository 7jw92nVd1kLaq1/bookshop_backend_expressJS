const { StatusCodes } = require('http-status-codes');

const pool = require('../db');
const { 
    changeUserPassword,
    createUser, 
    getUserByEmail 
} = require('../services/users-service');
const { 
    createUserToken, 
    generatePasswordResetCode,
    validatePasswordResetCode,
    markPasswordResetCodeAsUsed
} = require('../services/auth-service');
const { comparePassword } = require('../utils/auth-utils');


const signUp = async (req, res) => {
    const { nickname, email, password } = req.body;
    if (!nickname || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Nickname, email, and password are required'
        });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const user = await createUser(connection, email, password, nickname);
        const token = createUserToken(user);
        res.cookie('token', token, {
            httpOnly: true
        });

        return res.status(StatusCodes.CREATED).json({
            message: 'User created'
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Internal server error'
        });
    } finally {
        connection.release();
    }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Email and password are required'
        });
    }

    try {
        const user = await getUserByEmail(email);
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Invalid email or password'
            });
        }

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
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    }
};

const signOut = (req, res) => {
    res.clearCookie('token');
    return res.status(StatusCodes.OK).json({
        message: 'User logged out'
    });
};

const initiatePasswordResetProcess = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Email is required'
        });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const code = await generatePasswordResetCode(connection, email);
        await connection.commit();
        return res.status(StatusCodes.CREATED).json({
            message: 'Password reset code sent to your email'
        });
    } catch (error) {
        await connection.rollback();
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        if (error.name && error.name === 'UserNotFoundError') {
            return res.status(StatusCodes.CREATED).json({
                message: 'Password reset code sent to your email'
            });
        }
        return res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    } finally {
        connection.release();
    }
};

const completePasswordResetProcess = async (req, res) => {
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
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const code = await validatePasswordResetCode(resetCode);
        await changeUserPassword(connection, code.users_id, password);
        await markPasswordResetCodeAsUsed(connection, resetCode);

        await connection.commit();
        return res.status(StatusCodes.OK).json({
            message: 'Password reset successful'
        });
    } catch (error) {
        await connection.rollback();
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    signUp,
    signIn,
    signOut,
    initiatePasswordResetProcess,
    completePasswordResetProcess,
};