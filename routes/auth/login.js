const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const { API_URL } = require('../../helpers/constants');
const { usernameValidator, passwordValidator } = require('../../helpers/validators');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.username) res.redirect('/home');
  else res.render('login', { layout: 'fullscreen' });
});

router.post('/login', bodyParser.json(), async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || !usernameValidator(username) || !passwordValidator(password)) {
    res.sendStatus(400);
    return;
  }
  // Check if user exists and if password matches
  const resp = await fetch(`${API_URL}/users/${username}?password=${password}`);

  if (resp.status === 204) req.session.username = username;

  res.sendStatus(resp.status);
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.post('/register', bodyParser.json(), async (req, res) => {
  console.log(req.body);
  res.sendStatus(204);
});

module.exports = router;
