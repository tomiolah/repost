const express = require('express');
const fetch = require('node-fetch');

const { API_URL, minKarma } = require('../../helpers/constants');

const router = express.Router();

router.get('/subreposts', async (req, res) => {
  const subreposts = await (await fetch(`${API_URL}/subreposts?username=${req.session.username}`)).json();
  const user = await (await (fetch(`${API_URL}/users/${req.session.username}`))).json();
  console.log(subreposts);
  res.render('subreposts', {
    layout: 'main',
    username: req.session.username,
    subreposts: {
      active: true,
      data: subreposts,
    },
    minKarma: (user.rating >= minKarma),
  });
});

router.get('/r/:subrepost', async (req, res) => {
  const { subrepost } = req.params;

  if (!subrepost) {
    res.sendStatus(400);
    return;
  }

  const sr = await (await fetch(`${API_URL}/subreposts/${subrepost}`)).json();
  // Check if authorized
  // Get SRs associated with current user
  const subreposts = await (await fetch(`${API_URL}/subreposts?username=${req.session.username}`)).json();
  const arr = subreposts.filter(value => value.name === subrepost);

  if (!arr) {
    res.sendStatus(403);
    return;
  }

  const role = sr.users.find(value => value.username === req.session.username);

  res.render('subrepost', {
    layout: 'main',
    username: req.session.username,
    subrepost: sr,
    moderator: !!(role.moderator),
  });
});

module.exports = router;
