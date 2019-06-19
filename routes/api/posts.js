const express = require('express');
const request = require('request-promise-native');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');
const Post = require('../../models/post');

const { API_URL } = require('../../helpers/constants');

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

    const docs = await posts.exec();
    res.json(docs);
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

    const post = await Post.findById(postID);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create Post
router.post('/', async (req, res) => {
  const {
    subrepost,
    username,
    title,
    content,
  } = req.body;

  if (![subrepost, username, title, content].every(value => value)) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if SR exists
    const sr = await Subrepost.findOne({ name: subrepost }).exec();

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

    // Check if user can post in SR
    if (!sr.users.find(value => value.username === username)) {
      res.sendStatus(401);
      return;
    }

    await Post.create({
      subrepost,
      username,
      title,
      content,
    });

    res.sendStatus(204);
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

// UP / DOWNVOTE
router.patch('/:postID', async (req, res) => {
  const { postID } = req.params;
  const { rating, username } = req.body;

  if (![rating, username].every(value => value !== undefined) || ![-1, 0, 1].includes(rating)) {
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

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.sendStatus(404);
      return;
    }

    // Update data
    post.raters[username] = (rating === 0) ? undefined : rating;

    let ratingUpdated = 0;
    Object.keys(post.raters).forEach((key) => {
      ratingUpdated += (post.raters[key]) ? post.raters[key] : 0;
    });

    post.rating = ratingUpdated;

    // Update in DB
    Post.findByIdAndUpdate(postID, { $set: { rating: post.rating, raters: post.raters } });

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
    const posts = await Post.find().exec();
    posts.forEach(async (post) => {
      let marked = false;
      if (username && subrepost) {
        marked = (post.username === username && post.subrepost === subrepost);
      } else if (username) marked = post.username === username;
      else marked = post.subrepost === subrepost;

      if (marked) await request.delete(`${API_URL}/posts/${post._id}`);
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
    await request.delete(`${API_URL}/comments?post=${postID}`);

    // Delete from DB
    await Post.deleteOne({ _id: postID });
    res.sendStatus(204);
  } catch (error) {
    console.errror(error);
    res.sendStatus(500);
  }
});

module.exports = router;
