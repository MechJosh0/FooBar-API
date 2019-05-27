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
		return mysqlPromise.createPool({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			port: process.env.DATABASE_PORT,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
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

	async _query(query, params, connection)
	{
		let res;

		this.queries.push({ query, params });

		if(connection)
		{
			res = await connection.execute(query, params);
		}
		else
		{
			res = await this.connection.execute(query, params);
		}

		this.queries[this.queries.length - 1] = { query, params, res };

		return res;
	}

	async insert(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		return res[0].insertId;
	}

	async select(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		return res;
	}

	async select1(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		if(res[0].length === 0)
		{
			return null;
		}

		return res[0][Object.keys(res[0])[0]];
	}

	async select1r(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		return res[0];
	}

	async update(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		return res.affectedRows;
	}

	async delete(query, params, connection)
	{
		const res = await this._query(query, params, connection);

		return res.affectedRows;
	}

	async transaction(db, transactions)
	{
		const conn = await db.connection.getConnection();

		conn.insert = (query, params) => db.insert(query, params, conn);
		conn.select = (query, params) => db.select(query, params, conn);
		conn.select1 = (query, params) => db.select1(query, params, conn);
		conn.select1r = (query, params) => db.select1r(query, params, conn);
		conn.update = (query, params) => db.update(query, params, conn);
		conn.delete = (query, params) => db.delete(query, params, conn);

		try
		{
			await conn.beginTransaction();
			await transactions(conn);
			await conn.commit();

			conn.release();
		}
		catch(e)
		{
			console.error('MySQL transaction error: Roll back initiated!');

			conn.rollback();

			throw new Error(e.message);
		}
	}
}

module.exports = Database;
