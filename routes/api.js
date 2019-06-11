const express = require('express');

const users = require('./api/users');
const subreposts = require('./api/subreposts');
const posts = require('./api/posts');

const router = express.Router();

router.use('/users', users);
router.use('/subreposts', subreposts);
router.use('/posts', posts);

module.exports = router;
