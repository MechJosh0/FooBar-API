const mysqlPromise = require('mysql2/promise');
const mysql = require('mysql2');

class Database
{
	constructor()
	{
		this.queries = [];
	}

	/**
	 * Create the database connection
	 * @returns {Promise<*>}
	 */
	static async connect()
	{
		return mysqlPromise.createConnection({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			port: process.env.DATABASE_PORT
		});
	}

	/**
	 * Initiate the connection
	 * @returns {Promise<void>}
	 */
	async init()
	{
		try
		{
			this.connection = await Database.connect();
		}
		catch(e)
		{
			throw new Error(e.message);
		}
	}

	end()
	{
		if(this.connection)
		{
			this.connection.end();
		}
	}

	test(query, params)
	{
		return mysql.format(query, params);
	}

	async _query(query, params)
	{
		this.queries.push({ query, params });

		const res = await this.connection.execute(query, params);

		this.queries[this.queries.length - 1] = { query, params, res };

		return res;
	}

	async insert(query, params)
	{
		const res = await this._query(query, params);

		return res[0].insertId;
	}

	async select(query, params)
	{
		const res = await this._query(query, params);

		return res;
	}

	async update(query, params)
	{
		const res = await this._query(query, params);

		return res.affectedRows;
	}

	async delete(query, params)
	{
		const res = await this._query(query, params);

		return res.affectedRows;
	}
}

module.exports = Database;
