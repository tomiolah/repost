const express = require('express');
const fetch = require('node-fetch');

const { API_URL, minKarma, SERVICES_URL } = require('../../helpers/constants');

const router = express.Router();

router.get('/subreposts', async (req, res) => {
  const subreposts = await (await fetch(`${API_URL}/subreposts?username=${req.session.username}`)).json();
  const user = await (await (fetch(`${API_URL}/users/${req.session.username}`))).json();
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

  // Get Posts from SR
  const posts = await (await fetch(`${API_URL}/posts?subrepost=${subrepost}`)).json();

  const data = [];

  posts.forEach(async (post) => {
    const date = new Date(post.posted);
    const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`;
    const { content } = post;
    const result = await (await fetch(`${SERVICES_URL}/md2html`, {
      method: 'post',
      json: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown: content }),
    })).json();
    data.push({ date: dateStr, post, html: result.html });
  });

  res.render('subrepost', {
    layout: 'main',
    username: req.session.username,
    subrepost: sr,
    moderator: !!(role.moderator),
    posts: data,
  });
});

module.exports = router;
