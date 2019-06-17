const express = require('express');

const MD2HTML = require('./services/md2html');

const router = express.Router();

router.use(MD2HTML);

module.exports = router;
