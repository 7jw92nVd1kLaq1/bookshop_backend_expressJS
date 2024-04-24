const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


const Books = sequelize.define('books', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    categoriesId: {
        field: 'categories_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    authorsId: {
        field: 'authors_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'authors',
            key: 'id'
        }
    },
    pageNumber: {
        field: 'page_number',
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ISBN: {
        field: 'isbn',
        type: DataTypes.STRING(128),
        allowNull: true
    },
    pubDate: {
        field: 'pub_date',
        type: DataTypes.DATE,
        allowNull: true
    },
    publishers: {
        type: DataTypes.STRING(256),
        allowNull: true
    },
    form: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    }
}, {
    name: {
        singular: 'books',
        plural: 'books'
    },
    timestamps: false,
    hooks: {
        beforeUpdate: (book) => {
            book.updatedAt = new Date();
        }
    }
});


const BooksLikes = sequelize.define('books_likes', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: 'uniq_books_likes_key',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    booksId: {
        field: 'books_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: 'uniq_books_likes_key',
        references: {
            model: 'books',
            key: 'id'
        }
    }
}, {
    name: {
        singular: 'booksLike',
        plural: 'booksLikes'
    },
    timestamps: false
});

const BooksImages = sequelize.define('books_images', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    booksId: {
        field: 'books_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cover: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    uploadedAt: {
        field: 'uploaded_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    }
}, {
    name: {
        singular: 'booksImage',
        plural: 'booksImages'
    },
    timestamps: false
});

const Prices = sequelize.define('prices', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    booksId: {
        field: 'books_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
}, {
    name: {
        singular: 'prices',
        plural: 'prices'
    },
    timestamps: false
});


const Reviews = sequelize.define('reviews', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usersId: {
        field: 'users_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    booksId: {
        field: 'books_id',
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'books',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(320),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: true
        }
    }
}, {
    name: {
        singular: 'reviews',
        plural: 'reviews'
    },
    timestamps: false,
    hooks: {
        beforeUpdate: (review) => {
            review.updatedAt = new Date();
        }
    }
});


module.exports = {
    Books,
    BooksImages,
    BooksLikes,
    Prices,
    Reviews
};