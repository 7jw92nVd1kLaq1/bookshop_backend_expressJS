const { InvalidColumnError } = require('../exceptions/sql-exceptions');


class Validator {
    static validate() {
        throw new Error('validate method must be implemented.');
    }
}


class SQLKeywordsValidator extends Validator {
    static mysqlKeywords = [
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

    static validate(input, exclude = []) {
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


// Still in progress / Experimenting
class SelectQueryBuilder {
    constructor() {
        this.reset();
    }

    static isTableNameValid(table) {
        if (typeof table !== 'string') return false;
        if (!table.trim()) return false;
        if (/[^a-zA-Z0-9_\.\`]/g.test(table)) return false;

        return true;
    }

    static isJoinConditionValid(condition) {
        if (typeof condition !== 'string') return false;
        if (!condition.trim()) return false;
        if (/[^a-zA-Z0-9_\s\=\.\`]/.test(condition)) return false;

        return true;
    }

    static isColumnNameValid(field) {
        if (typeof field !== 'string') return false;
        if (!field.trim()) return false;
        if (/[^a-zA-Z0-9_\s\(\)\.\`\*]/g.test(field)) return false;

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
        if (!Array.isArray(fields)) {
            throw new Error('Fields must be an array.');
        } else if (fields.length === 0) {
            throw new Error('Fields array cannot be empty.');
        }

        const isEveryColumnValid = fields.every(SelectQueryBuilder.isColumnNameValid);
        if (isEveryColumnValid === false) {
            throw new InvalidColumnError(`In select: Invalid column name.`);
        }

        this.query.select = fields;
        return this;
    }

    from(table) {
        if (typeof table !== 'string') {
            throw new Error('Table name must be a string.');
        }
        if (!SelectQueryBuilder.isTableNameValid(table)) {
            throw new Error('Invalid table name.');
        }

        this.query.from = table;
        return this;
    }

    join(table, on) {
        if (
            typeof table !== 'string' || 
            typeof on !== 'string'
        ) {
            throw new Error('Invalid join condition.');
        }
        if (!SelectQueryBuilder.isTableNameValid(table)) {
            throw new Error('Invalid table name.');
        }
        if (!SelectQueryBuilder.isJoinConditionValid(on)) {
            throw new Error('Invalid join condition.');
        }

        const splitOn = on.split('=');
        if (splitOn.length !== 2) {
            throw new Error('Invalid join condition.');
        }

        this.query.join.push({ table, on });
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
        if (direction !== 'ASC' && direction !== 'DESC') {
            throw new Error('Invalid direction. It should be either ASC or DESC.');
        }

        this.query.orderBy.push({ field, direction });
        return this;
    }

    groupBy(field) {
        if (!SelectQueryBuilder.isColumnNameValid(field)) {
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
                queryString += ` JOIN ${j.table} ON ${j.on}`;
            });
        }

        if (this.query.groupBy.length) {
            queryString += ` GROUP BY ${this.query.groupBy.join(', ')}`;
            queryString += ` HAVING ${this.query.having.join(' AND ')}`;
        } else if (this.query.where.length) {
            queryString += ` WHERE ${this.query.where.join(' AND ')}`;
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

        return queryString;
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

// const builder = new SelectQueryBuilder();
// const query = builder
//     .select(['id', 'name', 'email'])
//     .from('users')
//     .where(`email = 'email@email.com'`)
//     .orderBy('name', 'ASC')
//     .limit(10)
//     .build();

// console.log(query); SELECT id, name, email FROM users WHERE email = 'email' ORDER BY name ASC LIMIT 10

module.exports = {
    SelectQueryBuilder,
    SQLKeywordsValidator,
    stringifyColumns
};