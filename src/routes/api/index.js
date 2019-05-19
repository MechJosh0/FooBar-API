const express = require('express');
const cors = require('cors');
const v1 = require('@/routes/api/v1');
const Database = require('@/models/Database');
const router = express.Router();

router.use((req, res, next) =>
{
	req.db = new Database();

	// res.on('finish', () =>
	// {
	// 	req.db.end();
	// });

	next();
});

router.use(cors());
router.use('/v1', v1);

module.exports = router;
