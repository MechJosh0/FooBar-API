const pong = async (req, res) =>
{
	const { db } = req;
	let result;

	await db.init();

	const id = await db.insert('INSERT INTO ping (id, datetime) VALUES (NULL, CURRENT_TIMESTAMP)');

	result = await db.select('SELECT * FROM ping WHERE id = ?', [id]);

	console.log(result[0]);

	await db.update('UPDATE ping SET datetime = ? WHERE id = ?', ['2000-01-01 12:00:00', id]);

	result = await db.select('SELECT * FROM ping WHERE id = ?', [id]);

	console.log(result[0]);

	await db.delete('DELETE FROM ping WHERE id = ?', [id]);

	res.status(200).json({
		pong: true
	});
};

module.exports = {
	pong
};
