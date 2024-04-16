const { InternalServerError } = require('../exceptions/generic-exceptions');
const { InvalidColumnError } = require('../exceptions/sql-exceptions');
const { promisePool } = require('../db');


class Validator {
    constructor() {
        if (this.constructor === Validator) {
            throw new Error('Cannot instantiate an abstract class.');
        }
    }

    validate() {
        throw new Error('validate method must be implemented.');
    }
}

class SQLKeywordsValidator extends Validator {
    mysqlKeywords = [
        "ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE",
        "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE",
        "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE",
        "CONVERT", "CREATE", "CROSS", "CUBE", "CUME_DIST", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP",
        "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE",
        "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DENSE_RANK", "DESC",
        "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL",
        "EACH", "ELSE", "ELSEIF", "EMPTY", "ENCLOSED", "ESCAPED", "EXCEPT", "EXISTS", "EXIT", "EXPLAIN",
        "FALSE", "FETCH", "FIRST_VALUE", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM",
        "FULLTEXT", "FUNCTION", "GENERATED", "GET", "GRANT", "GROUP", "GROUPING", "GROUPS", "HAVING",
        "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN",
        "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INT1", "INT2", "INT3",
        "INT4", "INT8", "INTEGER", "INTERVAL", "INTO", "IO_AFTER_GTIDS", "IO_BEFORE_GTIDS", "IS",
        "ITERATE", "JOIN", "JSON_TABLE", "KEY", "KEYS", "KILL", "LAG", "LAST_VALUE", "LATERAL",
        "LEAD", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME",
        "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_BIND",
        "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT",
        "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT",
        "NO_WRITE_TO_BINLOG", "NTH_VALUE", "NTILE", "NULL", "NUMERIC", "OF", "ON", "OPTIMIZE", "OPTIMIZER_COSTS",
        "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "OVER", "PARTITION", "PERCENT_RANK",
        "PERSIST", "PERSIST_ONLY", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "RANK", "READ",
        "READS", "READ_WRITE", "REAL", "RECURSIVE", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT",
        "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RLIKE", "ROW",
        "ROWS", "ROW_NUMBER", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR",
        "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE",
        "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING",
        "STORED", "STRAIGHT_JOIN", "SYSTEM", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT",
        "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED",
        "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY",
        "VARCHAR", "VARCHARACTER", "VARYING", "VIRTUAL", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH",
        "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL"
    ];
    exclude = [];

    constructor(exclude = []) {
        super();
        this.exclude = exclude;
    }


    validate(input, exclude = []) {
        if (typeof input !== 'string') return false;
        if (!input.trim()) return false;

        const words = input.trim().split(/\s+/);

        // Check if every word isn't part of a list of keywords, except for excluded words
        const isValid = words.every(word => {
            const cleanedWord = word.replace(/[^\w\.]/g, '').toUpperCase();
            if (exclude.includes(cleanedWord)) return true;
            if (SQLKeywordsValidator.mysqlKeywords.includes(cleanedWord)) {
                return false;
            };
            return true;
        });

        return isValid;
    }
}

class Query {
    constructor() {
        if (this.constructor === Query) {
            throw new Error('Cannot instantiate an abstract class.');
        }
    }
    async run() {
        throw new Error('run method must be implemented.');
    }
}

class InsertQuery extends Query {
    #count;
    #query;

    constructor(queryString) {
        super();
        if (typeof queryString !== 'string') {
            throw new Error('Query must be a string.');
        }

        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    setQueryString(queryString) {
        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    getQueryString() {
        return this.#query;
    }

    async run(connection, args = []) {
        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array.');
        }
        if (args.length !== this.#count) {
            throw new Error(`Number of arguments does not match the number of placeholders. It should have ${this.#count} arguments.`);
        }

        try {
            const [result] = await connection.query(this.#query, args);
            return result;
        } catch (error) {
            console.log(`DB error occurred in "InsertQuery.run": ${error.message}`);
            throw new InternalServerError('Error occurred while inserting data. Please try again.');
        }
    }
}

class DeleteQuery extends Query {
    #count;
    #query;

    constructor(queryString) {
        super();
        if (typeof queryString !== 'string') {
            throw new Error('Query must be a string.');
        }

        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    setQueryString(queryString) {
        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    getQueryString() {
        return this.#query;
    }

    async run(connection, args = []) {
        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array.');
        }
        if (args.length !== this.#count) {
            throw new Error(`Number of arguments does not match the number of placeholders. It should have ${this.#count} arguments.`);
        }

        try {
            const [result] = await connection.query(this.#query, args);
            return result;
        } catch (error) {
            console.log(`DB error occurred in "DeleteQuery.run": ${error.message}`);
            throw new InternalServerError('Error occurred while deleting data. Please try again.');
        }
    }
}

class SelectQuery extends Query {
    #count;
    #query;

    constructor(queryString) {
        super();
        if (typeof queryString !== 'string') {
            throw new Error('Query must be a string.');
        }

        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    setQueryString(queryString) {
        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    getQueryString() {
        return this.#query;
    }

    async run(args = []) {
        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array.');
        }
        if (args.length !== this.#count) {
            throw new Error(`Number of arguments does not match the number of placeholders. It should have ${this.#count} arguments.`);
        }

        try {
            const [rows] = await promisePool.query(this.#query, args);
            return rows;
        } catch (error) {
            console.log(`DB error occurred in "SelectQuery.run": ${error.message}`);
            throw new InternalServerError('Error occurred while fetching data. Please try again.');
        }
    }
}

// Still in progress / Experimenting
class QueryBuilder {
    static checkBackticks(field, maxBackticks = 2, strictMode = false) {
        const backticks = field.split('`');
        const backticksCount = backticks.length - 1;

        // Check if the count of backticks is an odd number
        if (backticksCount % 2 !== 0) return false;
        if (maxBackticks < 0) return false;

        // Check if the count of backticks exceeds the maximum allowed
        if (maxBackticks !== null && backticksCount > maxBackticks) return false;
        if (backticksCount && strictMode) {
            // Check if the first and last characters are backticks
            if (backticks[0].length > 0 || backticks[backticksCount].length > 0) return false;
            for (let i = 2; i < backticksCount - 1; i += 2) {
                if (backticks[i].length > 0) return false;
            }
        }

        return true;
    }

    constructor() {
        if (this.constructor === QueryBuilder) {
            throw new Error('Cannot instantiate an abstract class.');
        }
    }

    reset() {
        throw new Error('reset method must be implemented.');
    }

    build() {
        throw new Error('build method must be implemented.');
    }
}

class UpdateQuery extends Query {
    #count;
    #query;

    constructor(queryString) {
        super();
        if (typeof queryString !== 'string') {
            throw new Error('Query must be a string.');
        }

        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    setQueryString(queryString) {
        this.#query = queryString;
        this.#count = queryString.split('?').length - 1;
    }

    getQueryString() {
        return this.#query;
    }

    async run(connection, args = []) {
        if (!Array.isArray(args)) {
            throw new Error('Arguments must be an array.');
        }
        if (args.length !== this.#count) {
            throw new Error(`Number of arguments does not match the number of placeholders. It should have ${this.#count} arguments.`);
        }

        try {
            const [result] = await connection.query(this.#query, args);
            return result;
        } catch (error) {
            console.log(`DB error occurred in "UpdateQuery.run": ${error.message}`);
            throw new InternalServerError('Error occurred while updating data. Please try again.');
        }
    }
}


class InsertQueryBuilder extends QueryBuilder {
    constructor() {
        super();
        this.reset();
    }

    static isTableNameValid(table) {
        if (typeof table !== 'string') return false;
        if (!table.trim()) return false;
        if (/[^a-zA-Z0-9_\.\`]/g.test(table)) return false;
        if (super.checkBackticks(table, 2, true) === false) return false;

        return true;
    }

    static isColumnNameValid(field) {
        if (typeof field !== 'string') return false;
        if (!field.trim()) return false;
        if (/[^a-zA-Z0-9_\`]/g.test(field)) return false;
        if (super.checkBackticks(field, 2, true) === false) return false;

        return true;
    }

    reset() {
        this.query = {
            insert: [],
            into: null,
            values: [],
        };
    }

    insert(fields) {
        if (Array.isArray(fields) === false) {
            throw new Error('Fields must be an array.');
        } else if (fields.length === 0) {
            throw new Error('Fields array cannot be empty.');
        }

        const isEveryColumnValid = fields.every(InsertQueryBuilder.isColumnNameValid);
        if (isEveryColumnValid === false) {
            throw new InvalidColumnError(`In insert: Invalid column name.`);
        }

        this.query.insert = fields;
        return this;
    }

    into(table) {
        if (typeof table !== 'string') {
            throw new Error('Table name must be a string.');
        }
        if (InsertQueryBuilder.isTableNameValid(table) === false) {
            throw new Error('Invalid table name.');
        }

        this.query.into = table;
        return this;
    }

    values(values = []) {
        if (Array.isArray(values) === false) {
            throw new Error('Values must be an array.');
        } else if (values.length === 0) {
            throw new Error('Values array cannot be empty.');
        }

        const isArrayforArray = values.every(v => Array.isArray(v));
        if (isArrayforArray === false) {
            throw new Error('Values must be an array of arrays.');
        }

        this.query.values = values;
        return this;
    }

    build() {
        if (this.query.into === null) {
            throw new Error('Table name is required.');
        }

        if (this.query.values.length === 0) {
            throw new Error('Values are required.');
        }

        for (let i = 0; i < this.query.values.length; i++) {
            const values = this.query.values[i];
            if (values.length === 0) {
                throw new Error('Values array cannot be empty.');
            }
            const isEveryValueValid = values.every(v => typeof v === 'string');
            if (isEveryValueValid === false) {
                throw new Error('Values must be an array of strings.');
            }
        }

        if (this.query.insert.length > 0) {
            const valuesProvided = this.query.values.every(v => v.length === this.query.insert.length);
            if (valuesProvided === false) {
                throw new Error('Number of values does not match the number of columns.');
            }
        }

        let queryString = `INSERT INTO ${this.query.into}`;
        if (this.query.insert.length > 0) {
            queryString += ` (${this.query.insert.join(', ')})`;
        }
        queryString += ' VALUES ';
        queryString += this.query.values.map(v => `(${v.join(', ')})`).join(', ');

        return new InsertQuery(queryString);
    }
}

class DeleteQueryBuilder extends QueryBuilder {
    constructor() {
        super();
        this.reset();
    }

    static isTableNameValid(table) {
        if (typeof table !== 'string') return false;
        if (!table.trim()) return false;
        if (/[^a-zA-Z0-9_\.\`]/g.test(table)) return false;
        if (super.checkBackticks(table, 2, true) === false) return false;

        return true;
    }

    static isConditionValid(field) {
        if (typeof field !== 'string') return false;
        if (!field.trim()) return false;
        if (/[^a-zA-Z0-9_\`\?\s\'\"\=]/g.test(field)) return false;
        if (super.checkBackticks(field) === false) return false;

        return true;
    }

    reset() {
        this.query = {
            from: null,
            where: [],
        };
    }

    from(table) {
        if (typeof table !== 'string') {
            throw new Error('Table name must be a string.');
        }
        if (DeleteQueryBuilder.isTableNameValid(table) === false) {
            throw new Error('Invalid table name.');
        }

        this.query.from = table;
        return this;
    }

    where(condition) {
        if (typeof condition !== 'string') {
            throw new Error('Condition must be a string.');
        }
        if (!condition.trim()) {
            throw new Error('Condition cannot be empty.');
        }
        if (DeleteQueryBuilder.isConditionValid(condition) === false) {
            throw new Error('Invalid condition.');
        }

        condition = `(${condition})`;
        this.query.where.push(condition);
        return this;
    }

    build() {
        if (this.query.from === null) {
            throw new Error('Table name is required.');
        }

        let queryString = `DELETE FROM ${this.query.from}`;
        if (this.query.where.length) {
            queryString += ` WHERE ${this.query.where.join(' AND ')}`;
        }

        return new DeleteQuery(queryString);
    }
}

class SelectQueryBuilder extends QueryBuilder {
    constructor() {
        super();
        this.reset();
    }

    static isTableNameValid(table) {
        if (typeof table !== 'string') return false;
        if (!table.trim()) return false;
        if (/[^a-zA-Z0-9_\.\`]/g.test(table)) return false;
        if (super.checkBackticks(table) === false) return false;

        return true;
    }

    static isJoinConditionValid(condition) {
        if (typeof condition !== 'string') return false;
        if (!condition.trim()) return false;
        if (/[^a-zA-Z0-9_\s\=\.\`]/.test(condition)) return false;
        if (super.checkBackticks(condition) === false) return false;

        return true;
    }

    static isColumnNameValid(field) {
        if (typeof field !== 'string') return false;
        if (!field.trim()) return false;
        if (/[^a-zA-Z0-9_\s\(\)\.\`\*]/g.test(field)) return false;
        if (super.checkBackticks(field, null) === false) return false;

        return true;
    }

    reset() {
        this.query = {
            select: ['*'],
            join: [],
            from: null,
            where: [],
            orderBy: [],
            groupBy: [],
            having: [],
            limit: null,
            offset: null,
        };
    }

    select(fields = ['*']) {
        if (Array.isArray(fields) === false) {
            throw new Error('Fields must be an array.');
        } else if (fields.length === 0) {
            throw new Error('Fields array cannot be empty.');
        }

        this.query.select = fields;
        return this;
    }

    from(table) {
        if (typeof table !== 'string') {
            throw new Error('Table name must be a string.');
        }
        if (SelectQueryBuilder.isTableNameValid(table) === false) {
            throw new Error('Invalid table name.');
        }

        this.query.from = table;
        return this;
    }

    join(table, on, type = 'INNER') {
        // Check if table and on are strings
        if (
            typeof table !== 'string' || 
            typeof on !== 'string'
        ) {
            throw new Error('Invalid join condition.');
        }
        if (SelectQueryBuilder.isTableNameValid(table) === false) {
            throw new Error('Invalid table name.');
        }
        if (SelectQueryBuilder.isJoinConditionValid(on) === false) {
            throw new Error('Invalid join condition.');
        }
        if (type !== 'INNER' && type !== 'LEFT' && type !== 'RIGHT') {
            throw new Error('Invalid join type.');
        }

        // Check if on is in the format of 'table1.column1 = table2.column2'
        const splitOn = on.split('=');
        if (splitOn.length !== 2) {
            throw new Error('Invalid join condition.');
        }

        this.query.join.push({ table, on, type });
        return this;
    }

    where(condition) {
        if (typeof condition !== 'string') {
            throw new Error('Condition must be a string.');
        }
        if (!condition.trim()) {
            throw new Error('Condition cannot be empty.');
        }

        condition = `(${condition})`;
        this.query.where.push(condition);
        return this;
    }

    orderBy(field, direction = 'ASC') {
        if (!SelectQueryBuilder.isColumnNameValid(field)) {
            throw new InvalidColumnError(`In orderBy: ${field} is not a valid column name.`);
        }
        // Check if direction is either ASC or DESC
        if (direction !== 'ASC' && direction !== 'DESC') {
            throw new Error('Invalid direction. It should be either ASC or DESC.');
        }

        this.query.orderBy.push({ field, direction });
        return this;
    }

    groupBy(field) {
        if (SelectQueryBuilder.isColumnNameValid(field) === false) {
            throw new InvalidColumnError(`In groupBy: ${field} is not a valid column name.`);
        }

        this.query.groupBy.push(field);
        return this;
    }

    having(condition) {
        if (typeof condition !== 'string') {
            throw new Error('Condition must be a string.');
        }
        if (!condition.trim()) {
            throw new Error('Condition cannot be empty.');
        }

        this.query.having.push(condition);
        return this;
    }

    limit(limit) {
        if (typeof limit !== 'number') {
            throw new Error('Limit must be a number.');
        }
        if (limit < 1) {
            throw new Error('Limit must be greater than 0.');
        }

        this.query.limit = limit;
        return this;
    }

    offset(offset) {
        if (typeof offset !== 'number') {
            throw new Error('Offset must be a number.');
        }
        if (offset < 0) {
            throw new Error('Offset must be greater than or equal to 0.');
        }

        this.query.offset = offset;
        return this;
    }

    build() {
        let queryString = `SELECT ${this.query.select.join(', ')} FROM ${this.query.from}`;

        if (this.query.join.length) {
            this.query.join.forEach(j => {
                if (j.type) queryString += ` ${j.type}`;
                queryString += ` JOIN ${j.table} ON ${j.on}`;
            });
        }

        if (this.query.where.length) {
            queryString += ` WHERE ${this.query.where.join(' AND ')}`;
        }

        if (this.query.groupBy.length) {
            queryString += ` GROUP BY ${this.query.groupBy.join(', ')}`;
        } 

        if (this.query.having.length) {
            queryString += ` HAVING ${this.query.having.join(' AND ')}`;
        }

        if (this.query.orderBy.length) {
            const orderByClause = this.query.orderBy.map(ob => `${ob.field} ${ob.direction}`).join(', ');
            queryString += ` ORDER BY ${orderByClause}`;
        }

        if (this.query.limit !== null) {
            queryString += ` LIMIT ${this.query.limit}`;
        }

        if (this.query.offset !== null) {
            queryString += ` OFFSET ${this.query.offset}`;
        }

        return new SelectQuery(queryString);
    }
}

class UpdateQueryBuilder extends QueryBuilder {
    constructor() {
        super();
        this.reset();
    }

    static isTableNameValid(table) {
        if (typeof table !== 'string') return false;
        if (!table.trim()) return false;
        if (/[^a-zA-Z0-9_\.\`]/g.test(table)) return false;
        if (super.checkBackticks(table, 2, true) === false) return false;

        return true;
    }

    reset() {
        this.query = {
            table: null,
            set: [],
            where: [],
        };
    }

    table(table) {
        if (typeof table !== 'string') {
            throw new Error('Table name must be a string.');
        }
        if (UpdateQueryBuilder.isTableNameValid(table) === false) {
            throw new Error('Invalid table name.');
        }

        this.query.table = table;
        return this;
    }

    set(field, value) {
        if (typeof field !== 'string') {
            throw new Error('Field must be a string.');
        }
        if (!field.trim()) {
            throw new Error('Field cannot be empty.');
        }

        this.query.set.push(`${field} = ${value}`);
        return this;
    }

    where(condition) {
        if (typeof condition !== 'string') {
            throw new Error('Condition must be a string.');
        }
        if (!condition.trim()) {
            throw new Error('Condition cannot be empty.');
        }

        condition = `(${condition})`;
        this.query.where.push(condition);
        return this;
    }

    build() {
        if (this.query.table == null) {
            throw new Error('Table name is required.');
        }

        if (this.query.set.length === 0) {
            throw new Error('Set is required.');
        }

        let queryString = `UPDATE ${this.query.table} SET ${this.query.set.join(', ')}`;
        if (this.query.where.length) {
            queryString += ` WHERE ${this.query.where.join(' AND ')}`;
        }

        return new UpdateQuery(queryString);
    }
}

const stringifyColumns = (columns = []) => {
    const isColumnValid = columns.every(column => {
        if (typeof column !== 'string') return false;
        if (!column.trim()) return false;
        if (/[^a-zA-Z0-9_\(\)\.\`\*]/g.test(field)) return false;

        return true;
    });
    if (isColumnValid === false) {
        throw new InvalidColumnError();
    }
    return columns.length ? columns.join(', ') : '*';
};

// const selectBuilder = new SelectQueryBuilder();
// const selectQuery = selectBuilder
//     .select(['id', 'name', 'email'])
//     .from('users')
//     .where(`email = 'email@email.com'`)
//     .orderBy('name', 'ASC')
//     .limit(10)
//     .build();
// console.log(selectQuery.getQueryString());

// const builder = new InsertQueryBuilder();
// const query = builder
//     .insert(['name', 'email'])
//     .into('users')
//     .values([
//         ['?', '?'],
//         ['?', '?'],
//         ['?', '?'],
//     ])
//     .build();

// const builder = new DeleteQueryBuilder();
// const query = builder
//     .from('users')
//     .where('id = ?')
//     .build();
// console.log(query.getQueryString());

// const builder = new UpdateQueryBuilder();
// const query = builder
//     .table('users')
//     .set('name', '?')
//     .where('id = ?')
//     .build();
// console.log(query.getQueryString());

module.exports = {
    InsertQueryBuilder,
    DeleteQueryBuilder,
    SelectQueryBuilder,
    UpdateQueryBuilder,
    SQLKeywordsValidator,
    stringifyColumns
};