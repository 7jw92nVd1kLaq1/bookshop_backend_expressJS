const { InvalidColumnError } = require('../exceptions/sql-exceptions');


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
            throw new Error('Condition must be a string.');
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

        this.query.having.push(condition);
        return this;
    }

    limit(limit) {
        if (typeof limit !== 'number') {
            throw new Error('Limit must be a number.');
        }
        this.query.limit = limit;
        return this;
    }

    offset(offset) {
        if (typeof offset !== 'number') {
            throw new Error('Offset must be a number.');
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

// console.log(query);

module.exports = {
    SelectQueryBuilder,
    stringifyColumns
};