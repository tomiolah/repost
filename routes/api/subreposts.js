const express = require('express');
const request = require('request');

// User Model
const User = require('../../models/user');
const Subrepost = require('../../models/subrepost');

const router = express.Router();

// GET ALL SRs
router.get('/', async (req, res) => {
  try {
    const subreposts = await Subrepost.find();
    res.json(subreposts);
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
      moderators: [
        username,
      ],
    });

    if (err) throw err;
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Add / Remove user as moderator
router.patch('/:subrepost', async (req, res) => {
  const { subrepost } = req.params;
  const { username, rm }  = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ username });

    if (!userExists) {
      res.sendStatus(404);
      return;
    }

    // Check if SR exists
    const sr = await Subrepost({ name: subrepost });

    if (!sr) {
      res.sendStatus(404);
      return;
    }

    let del = false;

    if (rm) {
      userExists.subreposts = userExists.subreposts.filter(user => user !== username);
      User.updateOne({ username }, { $set: { subreposts: userExists.subreposts } });
      sr.moderators = sr.moderators.filter(mod => mod !== username);
      del = (sr.moderators.length === 0);
    } else sr.moderators.push(username);

    const err = Subrepost.updateOne({ name: subrepost }, { $set: { moderators: sr.moderators } });
    if (err) throw err;

    if (del) await request.delete(`/api/subreposts/${subrepost}`);

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
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

    // Delete from User collections
    const users = await User.find();

    users.forEach((usr) => {
      const temp = usr.subreposts.filter(item => item !== subrepost);
      User.updateOne({ username: usr.username }, { $set: { subreposts: temp } });
    });

    // TODO: Delete Post and subcomments
    request.delete(`/api/posts?subrepost=${subrepost}`);

    // Delete SR
    Subrepost.deleteOne({ name: subrepost });

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
