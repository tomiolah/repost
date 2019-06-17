const express = require('express');

const router = express.Router();

router.get('/home', (req, res) => res.render('home', { layout: 'main',  username: req.session.username, home: { active: true } }));

module.exports = router;
