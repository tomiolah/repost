const express = require('express');
const fetch = require('node-fetch');

const { API_URL } = require('../../helpers/constants');

const router = express.Router();

router.get('/explore', async (req, res) => {
  const subreposts = await (await fetch(`${API_URL}/subreposts?inverse=true&username=${req.session.username}`)).json();
  res.render('explore', {
    layout: 'main',
    username: req.session.username,
    subreposts: {
      data: subreposts,
    },
    explore: {
      active: true,
    },
  });
});

module.exports = router;
