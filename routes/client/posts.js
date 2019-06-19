const express = require('express');
const fetch = require('node-fetch');

// TODO:
// const { SERVICES_URL } = require('')

const router = express.Router();

router.get('/p/:postID', async (req, res) => {
  const { postID } = req.params;

  if (!postID) {
    res.sendStatus(400);
    return;
  }

  // Get Post
  const post = fetch(`/api/posts/${postID}`);

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

  res.render('post', {
    layout: 'main',
    username: req.session.username,
    post: {
      post,
      date: `${post.posted.getFullYear()}/${post.posted.getMonth() + 1}/${post.posted.getDay()}`,
      html: result.html,
    },
  });
});

module.exports = router;
