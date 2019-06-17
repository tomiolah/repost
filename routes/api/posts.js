const express = require('express');
const request = require('request-promise-native');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');
const Post = require('../../models/post');

const router = express.Router();

// GET ALL POSTS / BY QUERY
router.get('/', async (req, res) => {
  const { subrepost, username } = req.query;
  try {
    let posts;
    if (!subrepost && !username) posts = Post.find();
    else if (subrepost) {
      if (username) posts = Post.find({ subrepost, username });
      else posts = Post.find({ subrepost });
    } else posts = Post.find({ username });
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

// Create Post
router.post('/', async (req, res) => {
  const { subrepost, username, content } = req.body;

  if (!subrepost || !username || !content) {
    res.sendStatus(400);
    return;
  }

  try {
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

    // Check if user can posts in SR
    if (sr.users.find(value => value.username === username)) {
      res.sendStatus(401);
      return;
    }

    Post.create({
      subrepost,
      username,
      content,
    });
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

// UP / DOWNVOTE
router.patch('/:postID', async (req, res) => {
  const { postID } = req.params;
  const { rating } = req.body;

  if (!postID || !rating || (rating !== 1 && rating !== -1)) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if Post exists
    const post = await Post.findById(postID);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    // Update data
    post.rating += rating;

    // Update in DB
    Post.findByIdAndUpdate(postID, { $set: { rating: post.rating } });

    res.sendStatus(204);
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

// DELETE all Posts in SR / By User
router.delete('/', async (req, res) => {
  const { username, subrepost } = req.query;

  if (!username && !subrepost) {
    res.sendStatus(400);
    return;
  }

  try {
    const posts = await Post.find();
    posts.forEach(async (post) => {
      let marked = false;
      if (username && subrepost) {
        marked = (post.username === username && post.subrepost === subrepost);
      } else if (username) marked = post.username === username;
      else marked = post.subrepost === subrepost;

      if (marked) await request.delete(`/api/posts/${post._id}`);
    });

    res.sendStatus(204);
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

// Remove by ID
router.delete('/:postID', async (req, res) => {
  const { postID } = req.params;
  if (!postID) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if exists
    const post = Post.findById(postID);

    if (!post) {
      res.sendStatus(400);
      return;
    }

    // Delete Comments
    await request.delete(`/api/comments?post=${postID}`);

    // Delete from DB
    await Post.findByIdAndDelete(postID);
    res.sendStatus(204);
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

module.exports = router;
