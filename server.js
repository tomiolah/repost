const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const api = require('./routes/api');

const app = express();

app.use(bodyParser.json());

// MongoDB Config
const db = require('./config/keys').mongoURI;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connect to MongoDB
mongoose.connect(db)
  .then(() => console.log('🧣 :: Connection established'))
  .catch(err => console.err(`!! ${err}`));

// Connect API Routes
app.use('/api', api);

const port = process.env.port || 5000;

app.listen(port, () => console.log(`💻 :: Listening on port ${port}...`));
