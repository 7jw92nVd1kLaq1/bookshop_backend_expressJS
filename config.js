require('dotenv').config();

/* Server */
let port;

if (process.env.port && typeof process.env.port === 'number') {
    port = process.env.port;
} else if (process.env.PORT && typeof process.env.PORT !== 'number') {
    port = parseInt(process.env.PORT);
} else {
    port = 3000;
}

/* JWT */
const secret = process.env.SECRET_KEY || 'secret-key'; // Change this value to a more secure one

/* Database */
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME || 'mydb';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

/* bcrypt */
const saltRounds = 10;

module.exports = {
    saltRounds,
    port,
    secret,
    dbHost,
    dbPort,
    dbName,
    dbUser,
    dbPassword
};