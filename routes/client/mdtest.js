const express = require('express');

const router = express.Router();

router.get('/mdtest', (req, res) => {
  res.render('mdtest', { layout: 'testing' });
});

module.exports = router;
