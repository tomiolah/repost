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
    default: '',
  },

  mod_count: {
    type: Number,
    default: 1,
  },

  users: {
    type: Array({
      username: {
        type: String,
        require: true,
      },

      moderator: {
        type: Boolean,
        default: false,
      },
    }),
    default: [],
  },
});

const Subrepost = mongoose.model('subrepost', SubrepostSchema);

module.exports = Subrepost;
