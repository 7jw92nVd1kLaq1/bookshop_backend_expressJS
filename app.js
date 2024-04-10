const express = require('express');
const cookieParser = require('cookie-parser');

const { port } = require('./config');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const publishersRouter = require('./routes/publishers');
const authenticationRouter = require('./routes/authentication');
const categoriesRouter = require('./routes/categories');
const authorsRouter = require('./routes/authors');
const cartsRouter = require('./routes/carts');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/publishers', publishersRouter);
app.use('/', authenticationRouter);
app.use('/categories', categoriesRouter);
app.use('/authors', authorsRouter);
app.use('/carts', cartsRouter);

app.listen(port, () => {
    console.log('Server is running on port 3000');
});