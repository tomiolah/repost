const express = require('express');
const fetch = require('node-fetch');

const { API_URL, SERVICES_URL } = require('../../helpers/constants');

const router = express.Router();

router.get('/myposts', async (req, res) => {
  const posts = await (await fetch(`${API_URL}/posts?username=${req.session.username}`)).json();
  const output = [];

  posts.forEach((post) => {
    const date = new Date(post.posted);
    output.push({ post, date: `${date.getFullYear()}/${date.getMonth()}/${date.getDay()}` });
  });

  res.render('myposts', {
    layout: 'main',
    username: req.session.username,
    posts: {
      active: true,
      post: output,
    },
  });
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

  // Get Post SR
  const sr = await (await fetch(`${API_URL}/subreposts/${post.subrepost}`)).json();

  const userRecord = sr.users.find(value => value.username === req.session.username);

  // SR Mod or OP
  const del = (post.username === req.session.username) || (userRecord.moderator);

  // Get user Rating history
  const userInd = post.raters.findIndex(value => value.username === req.session.username);

  const rating = (userInd !== -1) ? post.raters[userInd].rating : 0;

  res.render('post', {
    layout: 'main',
    username: req.session.username,
    post: {
      post,
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`,
      html: result.html,
    },
    del,
    rating: (rating === 0) ? undefined : true,
    upvote: (rating === 1) ? true : undefined,
    downvote: (rating === -1) ? true : undefined,
    comments: comms,
  });
});

module.exports = router;
