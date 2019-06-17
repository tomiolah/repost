const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: username => /[a-zA-Z0-9]{2,}/.test(username),
    },
  },

  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
