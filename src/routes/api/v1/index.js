const express = require('express');
const ping = require('@/routes/api/v1/ping');

const router = express.Router();

router.use('/ping', ping);

module.exports = router;
