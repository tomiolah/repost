const express = require('express');
const bodyParser = require('body-parser');
const hljs = require('highlight.js');
const emoji = require('markdown-it-emoji');
const md = require('markdown-it')({
  html: false,
  xhtmlOut: false,
  breaks: true,
  langPrefix: '```',
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
      } catch (err) {
        console.error(err);
      }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

md.use(emoji);

const router = express.Router();

router.post('/md2html', bodyParser.json(), async (req, res) => {
  const { markdown } = req.body;

  const result = md.render(markdown);
  res.json({ markdown, html: result });
});

module.exports = router;
