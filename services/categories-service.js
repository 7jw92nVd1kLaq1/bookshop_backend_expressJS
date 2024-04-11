const pool = require('../db');
const { CategoryNotFoundError } = require('../exceptions/categories-exceptions');
const { stringifyColumns } = require('../utils/sql-utils');


const createCategory = async (connection, name, description) => {
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';

    let result;
    try {
        [result] = await connection.query(query, [name, description]);
    } catch (error) {
        console.log(`DB error occurred in "createCategory": ${error.message}`);
        throw new InternalServerError('Error occurred while creating category. Please try again.');
    }

    if (!result.affectedRows) {
        throw new InternalServerError('Category was not created. Please try again.');
    }

    return result.insertId;
};    

const getAllCategories = async (columns = ['id', 'name', 'description']) => {
    const columnsString = stringifyColumns(columns);
    const query = `SELECT ${columnsString} FROM categories`;

    let categories;
    try {
        const [rows] = await pool.query(query);
        categories = rows;
    } catch (error) {
        console.log(`DB error occurred in "getAllCategories": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching categories. Please try again.');
    }

    if (categories.length === 0) {
        throw new CategoryNotFoundError();
    }

    return categories;
};

const getCategoryById = async (id, columns = ['id', 'name', 'description']) => {
    const columnsString = stringifyColumns(columns);
    const query = `SELECT ${columnsString} FROM categories WHERE id = ?`;

    let category;
    try {
        const [rows] = await pool.query(query, [id]);
        category = rows[0];
    } catch (error) {
        console.log(`DB error occurred in "getCategoryById": ${error.message}`);
        throw new InternalServerError('Error occurred while fetching category. Please try again.');
    }

    if (!category) {
        throw new CategoryNotFoundError();
    }

    return category;
};

module.exports = {
    getAllCategories,
    getCategoryById
};