const express = require('express');
const request = require('request');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');
const pw = require('../../helpers/password');

const router = express.Router();

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    const output = [];

    // We don't send the saved passwords,
    // even though they are hashed and salted
    users.forEach(user => output.push({
      username: user.username,
      subreposts: user.subreposts,
    }));

    res.json(output);
  } catch (err) {
    res.sendStatus(500);
  }
});

// GET BY USERNAME
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      res.sendStatus(404);
      return;
    }
    const users = await User.find({ username });
    res.json({
      username: users.username,
      subreposts: users.subreposts,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

// POST USER
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.sendStatus(400);
      return;
    }

    if (!/[a-zA-Z0-9]{3,}/.test(username)
        || !/[a-zA-Z0-9]{3,}/.test(password)) {
      res.sendStatus(404);
      return;
    }

    // Process password
    const pwh = await pw.createHash(password);

    const { err } = await User.create({
      username,
      password: pwh,
    });

    if (err) throw err;

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ADD / REMOVE SUBREPOST TO / FROM USER
router.patch('/:username', async (req, res) => {
  try {
    const {  username } = req.params;
    const { subrepost, rm } = req.body;

    if (!username || !subrepost) {
      res.sendStatus(400);
      return;
    }

    // Check if subrepost exists
    const subExists = await Subrepost.findOne({ name: subrepost });
    if (!subExists) {
      res.sendStatus(404);
      return;
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.sendStatus(404);
      return;
    }

    if (rm) {
      user.subreposts = user.subrepost.filter(sr => sr !== subrepost);

      await request.patch(`/api/subreposts/${subrepost}`, {
        json: true,
        headers: [{
          name: 'content-type',
          value: 'application/json',
        }],
        body: JSON.stringify({
          username,
          rm: true,
        }),
      });
    } else user.subreposts.push(subrepost);

    const err = User.updateOne({ username }, { $set: { subreposts: user.subreposts } });
    if (err) throw err;
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// DELETE USER
router.delete('/:username', (req, res) => {
  const { username } = req.params;

  if (!username) {
    res.sendStatus(400);
    return;
  }

  User.deleteOne({ username }, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.sendStatus(204);
  });
});

module.exports = router;
