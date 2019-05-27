require('module-alias/register');
require('dotenv').config();

const axios = require('axios');
const Database = require('@/models/Database');

const run = async () =>
{
	const db = new Database();

	await db.init();

	const start = async () =>
	{
		try
		{
			console.log(`Connecting to ${process.env.NULS_ENV} node...`);
			const { data: { success, data } } = await axios(`${process.env.NODE_HOST}/${process.env.NULS_ENV}/block/height/1`);

			if(!success)
			{
				throw new Error(`Request error -> ${data.msg}`);
			}

			console.log(data);
		}
		catch(e)
		{
			console.warn('Error:', e.message);
		}
	};

	start();

	// setInterval(() =>
	// {
	// 	start();
	// }, 10000); // Every 5 minutes
};

run();
