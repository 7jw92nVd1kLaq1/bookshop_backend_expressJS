const { dbHost, dbPort, dbUser, dbPassword, dbName } = require('./config');
const mysqlSync = require('mysql2');
const mysql = require('mysql2/promise');

const { Sequelize } = require('sequelize');

const pool = mysqlSync.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    enableKeepAlive: true,
});

const promisePool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    enableKeepAlive: true,
});

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    },
});

module.exports = {
    pool,
    promisePool,
    sequelize
};