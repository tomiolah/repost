const express = require('express');
const request = require('request-promise-native');
const fetch = require('node-fetch');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');

const router = express.Router();

const { API_URL } = require('../../helpers/constants');

// GET ALL SRs / BY USER
router.get('/', async (req, res) => {
  const { username, inverse } = req.query;
  try {
    const subreposts = (await Subrepost.find().exec());
    const output = (username)
      ? subreposts.filter((sr) => {
        console.log(sr);
        return (inverse)
          ? (sr.users.every(value => (value.username !== username)))
          : (sr.users.some(value => (value.username === username)));
      })
      : subreposts;

    console.log(output);

    res.json(output);
  } catch (err) {
    res.sendStatus(500);
  }
});

// GET SR BY NAME
router.get('/:subrepost', async (req, res) => {
  const { subrepost } = req.params;

  try {
    const subreposts = await Subrepost.findOne({ name: subrepost });
    res.json(subreposts);
  } catch (err) {
    res.sendStatus(500);
  }
});

// POST SR
router.post('/', async (req, res) => {
  const { name, description, username } = req.body;

  if (!name || !username) {
    res.sendStatus(400);
    return;
  }

  try {
    const err = await Subrepost.create({
      name,
      description: (description) || '',
      users: [
        {
          username,
          moderator: true,
        },
      ],
    });

    if (err) throw err;
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// PATCH SR
router.patch('/:subrepost', async (req, res) => {
  const { subrepost } = req.params;
  const { username, moderator, remove } = req.body;

  if (!username || !(await User.findOne({ username }))) {
    res.sendStatus(400);
    return;
  }

  const sub = await Subrepost.findOne({ name: subrepost });

  if (!sub) {
    res.sendStatus(404);
    return;
  }

  // Check if remove
  if (remove) {
    // Update Mod Count
    let count = 0;

    sub.users = sub.users.filter((value) => {
      count += (value.username !== username && value.moderator) ? 1 : 0;
      return (value.username !== username);
    });

    sub.mod_count = count;

    if (count === 0) await request.delete(`${API_URL}/subreposts/${subrepost}`);
    else {
      await Subrepost.updateOne({ name: subrepost }, {
        $set: {
          mod_count: sub.mod_count,
          users: sub.users,
        },
      });
    }
    res.sendStatus(204);
    return;
  }

  if (sub.users.find(value => value.username === username)) {
    // Exists
    sub.users[sub.users.findIndex(obj => obj.username === username)].moderator = !!moderator;
  } else {
    // Not exists -  Add it
    sub.users.push({
      username,
      moderator: !!moderator,
    });
  }

  // Count Mods
  sub.mod_count = sub.users.reduce(
    (acc, currentValue) => acc + ((currentValue.moderator) ? 1 : 0),
    0,
  );

  if (sub.mod_count === 0) await fetch(`${API_URL}/subreposts/${subrepost}`, { method: 'DELETE' });
  else {
    // Update in DB
    await Subrepost.updateOne({ name: subrepost }, {
      $set: {
        mod_count: sub.mod_count,
        users: sub.users,
      },
    });
  }

  res.sendStatus(204);
});

router.delete('/:subrepost', async (req, res) => {
  const { subrepost } = req.params;

  if (!subrepost) {
    res.sendStatus(400);
    return;
  }

  try {
    // Check if SR exists
    const sr = await Subrepost.findOne({ name: subrepost });

    if (!sr) {
      res.sendStatus(404);
      return;
    }

    // Delete Posts
    await fetch(`${API_URL}/posts?subrepost=${subrepost}`, { method: 'DELETE' });

    // Delete SR
    await Subrepost.deleteOne({ name: subrepost });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
