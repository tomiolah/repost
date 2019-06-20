const express = require('express');
const fetch = require('node-fetch');

const { API_URL, SERVICES_URL } = require('../../helpers/constants');

const router = express.Router();

router.get('/myposts', async (req, res) => {
  // TODO
  const posts = await fetch(`${API_URL}/posts?username=${req.session.username}`);
});

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

  // Get root comments
  const comments = await (await fetch(`${API_URL}/comments?root=true&postID=${postID}`)).json();
  const comms = [];

  comments.forEach((comment) => {
    const datee = new Date(comment.posted);
    comms.push({
      comment,
      date: `${datee.getFullYear()}/${datee.getMonth() + 1}/${datee.getDay()}`,
    });
  });

  res.render('post', {
    layout: 'main',
    username: req.session.username,
    post: {
      post,
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`,
      html: result.html,
    },
    comments: comms,
  });
});

module.exports = router;
