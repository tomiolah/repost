const express = require('express');
const mdtest = require('./client/mdtest');
const login = require('./auth/login');
const home = require('./client/home');
const explore = require('./client/explore');
const subreposts = require('./client/subreposts');

const router = express.Router();

router.use(mdtest);
router.use(login);

router.use((req, res, next) => {
  if (req.session.username) next();
  else res.redirect('/login');
});

router.use(home);
router.use(explore);
router.use(subreposts);

module.exports = router;
