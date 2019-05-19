const pong = async (req, res) =>
{
	const { db } = req;

	await db.init();

	try
	{
		await db.transaction(db, async (tr) =>
		{
			let result;

			const id = await tr.insert('INSERT INTO ping (id, datetime) VALUES (NULL, CURRENT_TIMESTAMP)');

			console.log(`Inserted ${id}`);

			result = await tr.select1r('SELECT * FROM ping WHERE id = ?', [id]);

			console.log('Updated', result[0]);

			await tr.update('UPDATE ping SET datetime = ? WHERE id = ?', ['2000-01-01 12:00:00', id]);

			result = await tr.select1r('SELECT * FROM ping WHERE id = ?', [id]);

			console.log('Updated', result[0]);

			await tr.delete('DELETE FROM ping WHERE id = ?', [id]);

			console.log(`Deleted ${id}`);
		});
	}
	catch(e)
	{
		console.error(e.message);
	}

	res.status(200).json({
		pong: true
	});
};

module.exports = {
	pong
};
