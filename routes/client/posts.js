const express = require('express');
const fetch = require('node-fetch');

const { API_URL, SERVICES_URL } = require('../../helpers/constants');

const router = express.Router();

router.get('/p/:postID', async (req, res) => {
  const { postID } = req.params;

  if (!postID) {
    res.sendStatus(400);
    return;
  }

  // Get Post
  const post = await (await fetch(`${API_URL}/posts/${postID}`)).json();

  if (!post) {
    res.sendStatus(404);
    return;
  }

  const result = await (await fetch(`${SERVICES_URL}/md2html`, {
    method: 'post',
    json: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ markdown: post.content }),
  })).json();

  const date = new Date(post.posted);

  res.render('post', {
    layout: 'main',
    username: req.session.username,
    post: {
      post,
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`,
      html: result.html,
    },
  });
});

module.exports = router;
