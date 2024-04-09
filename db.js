const { dbHost, dbPort, dbUser, dbPassword, dbName } = require('./config');
const mysql = require('mysql2/promise');

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

module.exports = promisePool;