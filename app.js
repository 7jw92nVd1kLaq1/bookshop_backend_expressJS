const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { port } = require('./config');
const throwError = require('./middlewares/error-middleware');

const {} = require('./models/index');

const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication');
const categoriesRouter = require('./routes/categories');
const authorsRouter = require('./routes/authors');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: `http://localhost:${port}`}));

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/', authenticationRouter);
app.use('/categories', categoriesRouter);
app.use('/authors', authorsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);

app.use(throwError);

app.listen(port, () => {
    console.log('Server is running on port 3000');
});