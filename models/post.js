const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const PostSchema = new Schema({
  subrepost: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  posted: {
    type: Date,
    default: Date.now(),
  },

  rating: {
    type: Number,
    default: 0,
  },

  raters: {
    type: Array,
    default: [],
  },
});

const Post = mongoose.model('post', PostSchema);

module.exports = Post;
