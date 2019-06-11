const express = require('express');
const request = require('request');

const Post = require('../../models/post');
const Comment = require('../../models/comment');

const router = express.Router();

// Get all
router.get('', async (req, res) => {
  const { username, postID, parentID } = req.query;

  try {
    const comments = (await Comment.find().sort({ posted: -1 })).filter((comment) => {
      let verdict = true;
      if (username && comment.username !== username) verdict = false;
      if (postID && comment.post !== postID) verdict = false;
      if (parentID && comment.parent !== parentID) verdict = false;
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
  const { rating } = req.body;

  if (!commentID || (!rating || (rating !== 1 && rating !== -1))) {
    res.sendStatus(400);
    return;
  }

  try {
    const comment = await Comment.findById(commentID);
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    comment.rating += rating;
    await Comment.findByIdAndUpdate(commentID, { $set: { rating: comment.rating } });
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
    const subcomments = await Comment.find({ parent: commentID });
    // Delete subcomments
    subcomments.forEach(async (subcomment) => {
      await request.delete(`/api/comments/${subcomment._id}`);
    });

    await Comment.findByIdAndDelete(commentID);

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
