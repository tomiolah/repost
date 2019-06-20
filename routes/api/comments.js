const express = require('express');
const request = require('request-promise-native');

const Post = require('../../models/post');
const User = require('../../models/user');
const Comment = require('../../models/comment');

const { API_URL } = require('../../helpers/constants');

const router = express.Router();

function help2(comment, parentID, root) {
  if (parentID && comment.parent === parentID) return false;
  if (root && comment.parent) return false;
  return true;
}

function help(comment, username, postID, parentID, root) {
  if (username && comment.username !== username) return false;
  if (postID && comment.post !== postID) return false;
  return help2(comment, parentID, root);
}

// Get all
router.get('', async (req, res) => {
  const {
    username,
    postID,
    parentID,
    root,
  } = req.query;

  try {
    const comments = [];
    const resp = await Comment.find()
      .sort({ posted: -1 })
      .exec();

    resp.filter((comment) => {
      const verdict = help(comment, username, postID, parentID, root);
      if (verdict) comments.push(comment);
      return verdict;
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Get By ID
router.get('/:commentID', async (req, res) => {
  const { commentID } = req.params;

  if (!commentID) {
    res.sendStatus(400);
    return;
  }

  // Check if comment exists
  const comment = await Comment.findById(commentID);

  if (!comment) {
    res.sendStatus(404);
    return;
  }

  res.json(comment);
});

// Create
router.post('/', async (req, res) => {
  const {
    username,
    content,
    parentID,
  } = req.body;
  let { postID } = req.body;

  if (!username || !content || (!parentID && !postID)) {
    res.sendStatus(400);
    return;
  }

  if (parentID) {
    // Check if parent exists
    const parent = await Comment.findById(parentID);

    if (!parent) {
      res.sendStatus(400);
      return;
    }

    // Get Parent's PostID
    postID = parent.post;
  }

  // Check if post exists
  const post = await Post.findById(postID);

  if (!post) {
    res.sendStatus(400);
    return;
  }

  // Put it in the DB
  Comment.create({
    username,
    content,
    post: postID,
    parent: parentID,
  });

  res.sendStatus(204);
});

// UP / DOWNVOTE
router.patch('/:commentID', async (req, res) => {
  const { commentID } = req.query;
  const { rating, username } = req.body;

  if ([commentID, rating, username].every(value => value !== undefined)) {
    res.sendStatus(400);
    return;
  }

  if (![-1, 0, 1].includes(rating)) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.sendStatus(404);
      return;
    }
    const comment = await Comment.findById(commentID);
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    comment.raters[username] = (rating === 0) ? undefined : rating;

    let ratingUpdated = 0;
    Object.keys(comment.raters).forEach((key) => {
      ratingUpdated += (comment.raters[key]) ? comment.raters[key] : 0;
    });

    comment.rating = ratingUpdated;
    await Comment.findByIdAndUpdate(commentID, {
      $set: {
        rating: comment.rating,
        raters: comment.raters,
      },
    });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Remove by Post
router.delete('/', async (req, res) => {
  const { postID } = req.params;

  if (!postID) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if post exists
    const post = await Post.findById(postID);
    if (!post) {
      res.sendStatus(404);
      return;
    }
    await Comment.deleteMany({ post: postID });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Remove By ID
router.delete('/:commentID', async (req, res) => {
  const { commentID } = req.query;

  if (!commentID) {
    res.sendStatus(400);
    return;
  }

  try {
    const comment = await Comment.findById(commentID);
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    // Get subcomments
    const subcomments = await Comment.find({ parent: commentID }).exec();
    // Delete subcomments
    subcomments.forEach(async (subcomment) => {
      await request.delete(`${API_URL}/comments/${subcomment._id}`);
    });

    await Comment.findByIdAndDelete(commentID);

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
