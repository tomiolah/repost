const express = require('express');
const mdtest = require('./client/mdtest');
const login = require('./auth/login');
const home = require('./client/home');

const router = express.Router();

router.use(mdtest);

router.use(login);

router.use((req, res, next) => {
  if (req.session.username) next();
  else res.redirect('/login');
});

router.use(home);

module.exports = router;
