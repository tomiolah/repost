const express = require('express');
const request = require('request-promise-native');

// User Model
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
const pw = require('../../helpers/password');

const router = express.Router();

const calculateRating = async (username) => {
  // Get all Posts
  const posts = await Post.find({ username });

  // Get all comments
  const comments = await Comment.find({ username });

  // Calculate rating
  let rating = 0;

  posts.forEach((post) => { rating += post.rating; });
  comments.forEach((comment) => { rating += comment.rating; });

  return rating;
};

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    const output = [];

    users.forEach(async (user) => {
      // Calculate User Rating
      const userRating = await calculateRating(user.username);
      output.push({
        username: user.username,
        subreposts: user.subreposts,
        rating: userRating,
      });
    });

    res.json(output);
  } catch (err) {
    res.sendStatus(500);
  }
});

// GET BY USERNAME
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.query;
    if (!username) {
      res.sendStatus(404);
      return;
    }
    const user = await User.findOne({ username });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (password) {
      // Check password against PW in DB
      const verdict = pw.checkHash(password, user.password);
      if (verdict) res.sendStatus(204);
      else res.sendStatus(401);
      return;
    }

    // Calculate Rating
    const rating = await calculateRating(username);
    res.json({
      username: user.username,
      subreposts: user.subreposts,
      rating,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

// POST USER
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.sendStatus(400);
      return;
    }

    // Check if user already exists
    const user = await User.find({ username });

    if (user) {
      res.sendStatus(401);
      return;
    }

    if (!/[a-zA-Z0-9]{3,}/.test(username)
        || !/[a-zA-Z0-9]{3,}/.test(password)) {
      res.sendStatus(404);
      return;
    }

    // Process password
    const pwh = await pw.createHash(password);

    const { err } = await User.create({
      username,
      password: pwh,
    });

    if (err) throw err;

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// DELETE USER
router.delete('/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    res.sendStatus(400);
    return;
  }

  // Remove from Subreposts
  // Get affected SRs
  const subreposts = await request.get(`/api/subreposts?username=${username}`);

  subreposts.forEach(async (subrepost) => {
    await request.patch(`/api/subreposts/${subrepost.name}`, {
      json: true,
      body: JSON.stringify({
        username,
        remove: true,
      }),
    });
  });

  // Remove Posts
  // Get Posts
  await request.delete(`/api/posts?username=${username}`);

  // Remove Comments
  // Get Comments
  const comments = await request.get(`/api/comments?username=${username}`);

  comments.forEach(async (comment) => {
    await request.delete(`/api/comments/${comment._id}`);
  });

  // Finally, delete the user
  User.deleteOne({ username }, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(204);
  });
});

module.exports = router;
