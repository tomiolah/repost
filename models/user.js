const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (username) => {
        return /[a-zA-Z0-9]{3,}/.test(username);
      },
    },
  },

  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
