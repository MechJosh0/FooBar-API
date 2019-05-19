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
		const res = await axios('https://api.coinmarketcap.com/v1/ticker/nuls/');
		const [data] = res.data;

		await db.insert(
			`INSERT INTO price
			(source, timestamp, price_usd, price_btc, rank, market_cap_usd, volume_24h_usd)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				'coinmarketcap',
				Math.floor(new Date() / 1000),
				data.price_usd,
				data.price_btc,
				data.rank,
				data.market_cap_usd,
				data['24h_volume_usd']
			]
		);

		console.info(`Stored NULS price: $${Number(data.price_usd).toFixed(2)}`);
	};

	start();

	setInterval(() =>
	{
		start();
	}, 60000 * 5); // Every 5 minutes
};

run();
