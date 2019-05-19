const pong = async (req, res) =>
{
	res.status(200).json({
		pong: true
	});
};

module.exports = {
	pong
};
