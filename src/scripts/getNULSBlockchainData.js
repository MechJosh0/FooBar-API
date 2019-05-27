require('module-alias/register');
require('dotenv').config();

const axios = require('axios');
const { forEach } = require('p-iteration');
const logger = require('@/utils/winston');
const Database = require('@/models/Database');
const { sleep } = require('@/utils/debugTools');

const processBlockHeader = async (tr, header) =>
{
	delete header.txList;

	// Insert header query...
};

const processBlockTransactions = async (tr, transactions) =>
{
	logger.verbose('Inserting transaction...');

	await forEach(transactions, async (transaction) =>
	{
		await sleep(2); // Debug
		// Insert transaction query...
		logger.verbose('Transaction inserted');
	});

	logger.verbose('Inserting transactions completed');
};

const run = async () =>
{
	const db = new Database();
	const date = new Date();
	let sleepSeconds = 10; // This is overwritten

	await db.init();

	const start = async () =>
	{
		try
		{
			await db.transaction(db, async (tr) =>
			{
				logger.verbose(`Connecting to ${process.env.NULS_ENV} node...`);

				const latestLocalHeight = await tr.select1('SELECT height FROM blockHeaders ORDER BY id DESC LIMIT 1');
				const nextLocalHeight = (latestLocalHeight || 0) + 1;

				const { data: { data: { value: latestNetworkHeight } } } = await axios(`${process.env.NODE_HOST}/${process.env.NULS_ENV}/block/newest/height`);

				if(nextLocalHeight > latestNetworkHeight) // Network hasn't confirmed the next block yet
				{
					// In theory we should never see this but it's a fallback
					sleepSeconds = 1;
					logger.verbose(`We're at the maximum height: ${latestNetworkHeight}`);

					return;
				}

				logger.verbose(`Getting next height: ${nextLocalHeight}`);

				const { data: { success, data: block } } = await axios(`${process.env.NODE_HOST}/${process.env.NULS_ENV}/block/height/${nextLocalHeight}`);

				if(!success)
				{
					throw new Error(`Request error -> ${block.msg}`);
				}

				logger.verbose(`We found block height: ${block.height}`);

				await processBlockTransactions(tr, block.txList);
				await processBlockHeader(tr, block);

				if(block.height !== latestNetworkHeight)
				{
					sleepSeconds = 0;
					logger.verbose(`We do not have the max height ${block.height}/${latestNetworkHeight}`);
				}
				else
				{
					sleepSeconds = 10 - parseInt((`${date.getSeconds()}`)[1] || date.getSeconds(), 10); // Calculate seconds to the next 10 second block in time
					logger.verbose(`Sleep until the next height: ${sleepSeconds}`);
				}
			});
		}
		catch(e)
		{
			logger.error(e.message);
		}
	};

	start();

	// setInterval(() =>
	// {
	// 	start();
	// }, sleepSeconds * 1000);
};

run();
