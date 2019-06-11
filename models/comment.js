const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const CommentSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  posted: {
    type: Date,
    default: Date.now(),
  },

  content: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    default: 0,
  },

  post: {
    type: String,
    required: true,
  },

  parent: {
    type: String,
    default: undefined,
  },
});

const Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;
