const express = require('express');
const request = require('request');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');
const Post = require('../../models/post');

const router = express.Router();

// GET ALL POSTS / BY QUERY
router.get('/', async (req, res) => {
  const { subrepost } = req.query;
  try {
    const posts = (subrepost) ? await Post.find() : await Post.find({ subrepost });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// GET POST BY ID
router.get('/:postID', async (req, res) => {
  try {
    const { postID } = req.params;

    if (!postID) {
      res.sendStatus(400);
      return;
    }

    const { err, post } = await Post.findById(postID);
    if (err) throw err;
    res.json(post);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const { subrepost, username, content } = req.body;

  if (!subrepost || !username || !content) {
    res.sendStatus(400);
    return;
  }

  // Check if SR exists
  const sr = await Subrepost.findOne({ name: subrepost });

  if (!sr) {
    res.sendStatus(404);
    return;
  }

  // Check if User exists
  const userExists = await User.findOne({ username });

  if (!userExists) {
    res.sendStatus(404);
    return;
  }

  Post.create({
    subrepost,
    username,
    content,
  });
});

// DELETE all Posts in SR

module.exports = router;
