const { sequelize } = require('../db');

const { Roles, PasswdResets } = require('./auth-models');
const { Authors, AuthorsLikes } = require('./authors-models');
const { Categories } = require('./categories-models');
const { Users, UsersRoles, ProfileImages } = require('./users-models');
const { Books, BooksImages, BooksLikes, Prices, Reviews } = require('./books-models');
const { Carts, CartsItems } = require('./carts-models');
const { Addresses, Orders, OrdersBooks, Statuses, TrackingCodes } = require('./orders-models');


Addresses.belongsTo(Users, {
    foreignKey: 'users_id'
});

Authors.belongsToMany(Users, {
    through: AuthorsLikes,
    foreignKey: 'authors_id',
    otherKey: 'users_id',
    uniqueKey: 'uniq_users_authors_likes_key'
});

Authors.hasMany(Books, {
    foreignKey: 'authors_id'
});

Books.belongsTo(Authors, {
    foreignKey: 'authors_id'
});

Books.belongsTo(Categories, {
    foreignKey: 'categories_id',
});

Books.hasMany(BooksImages, {
    foreignKey: 'books_id'
});

Books.hasMany(CartsItems, {
    foreignKey: 'books_id'
});

BooksImages.belongsTo(Books, {
    foreignKey: 'books_id'
});

Books.belongsToMany(Users, {
    through: BooksLikes,
    foreignKey: 'books_id',
    otherKey: 'users_id',
    uniqueKey: 'uniq_books_likes_key'
});

Books.hasMany(BooksLikes, {
    foreignKey: 'books_id'
});

Books.hasMany(Prices, {
    foreignKey: 'books_id'
});

Books.hasMany(Reviews, {
    foreignKey: 'books_id'
});

BooksLikes.belongsTo(Books, {
    foreignKey: 'books_id'
});

Carts.belongsTo(Users, {
    foreignKey: 'users_id'
});

Carts.hasMany(CartsItems, {
    foreignKey: 'carts_id'
});

CartsItems.belongsTo(Carts, {
    foreignKey: 'carts_id'
});

CartsItems.belongsTo(Books, {
    foreignKey: 'books_id'
});

Categories.hasMany(Books, {
    foreignKey: 'categories_id'
});

Orders.belongsTo(Addresses, {
    foreignKey: 'addresses_id'
});

Orders.belongsTo(Users, {
    foreignKey: 'users_id'
});

Orders.belongsTo(Statuses, {
    foreignKey: 'statuses_id'
});

Orders.hasMany(OrdersBooks, {
    foreignKey: 'orders_id'
});

Orders.hasMany(TrackingCodes, {
    foreignKey: 'orders_id'
});

OrdersBooks.belongsTo(Books, {
    foreignKey: 'books_id'
});

OrdersBooks.belongsTo(Orders, {
    foreignKey: 'orders_id'
});

OrdersBooks.belongsTo(Prices, {
    foreignKey: 'prices_id'
});

PasswdResets.belongsTo(Users, {
    foreignKey: 'users_id'
});

Prices.belongsTo(Books, {
    foreignKey: 'books_id'
});

ProfileImages.belongsTo(Users, {
    foreignKey: 'users_id'
});

Reviews.belongsTo(Books, {
    foreignKey: 'books_id'
});

Reviews.belongsTo(Users, {
    foreignKey: 'users_id'
});

Statuses.hasMany(Orders, {
    foreignKey: 'statuses_id'
});

TrackingCodes.belongsTo(Orders, {
    foreignKey: 'orders_id'
});

Users.hasMany(Addresses, {
    foreignKey: 'users_id'
});

Users.hasMany(Carts, {
    foreignKey: 'users_id'
});

Users.hasMany(Orders, {
    foreignKey: 'users_id'
});

Users.hasMany(PasswdResets, {
    foreignKey: 'users_id'
});

Users.hasMany(ProfileImages, {
    foreignKey: 'users_id'
});

Users.hasMany(Reviews, {
    foreignKey: 'users_id'
});

Users.belongsToMany(Authors, {
    through: AuthorsLikes,
    foreignKey: 'users_id',
    otherKey: 'authors_id',
    uniqueKey: 'uniq_users_authors_likes_key'
});

Users.belongsToMany(Roles, {
    through: UsersRoles,
    foreignKey: 'users_id',
    otherKey: 'roles_id',
    uniqueKey: 'unique_user_role_id'
});

Roles.belongsToMany(Users, {
    through: UsersRoles,
    foreignKey: 'roles_id',
    otherKey: 'users_id',
    uniqueKey: 'unique_user_role_id'
});

const initialize = async () => {
    try {
        await sequelize.sync();
    } catch (error) {
        console.error('Error initializing models:', error);
    }
}

module.exports = {
    initialize
};