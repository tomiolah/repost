const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const SubrepostSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: name => /[a-zA-Z0-9]+/.test(name),
    },
  },

  description: {
    type: String,
    required: false,
  },

  moderators: {
    type: Array(String),
    default: [],
  },
});

const Subrepost = mongoose.model('subrepost', SubrepostSchema);

module.exports = Subrepost;
