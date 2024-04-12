const { dbHost, dbPort, dbUser, dbPassword, dbName } = require('./config');
const mysqlSync = require('mysql2');
const mysql = require('mysql2/promise');

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

module.exports = {
    pool,
    promisePool
};