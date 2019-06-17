const ip = require('ip');
const path = require('path');
const chalk = require('chalk');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');

const api = require('./routes/api');
const client = require('./routes/client');
const services = require('./routes/services');

const app = express();

app.use(bodyParser.json());

// MongoDB Config
const db = require('./config/keys').mongoURI;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connect to MongoDB
mongoose.connect(db)
  .then(() => console.log('📼 :: DB Connection established'))
  .catch(err => console.err(`!! ${err}`));

// Set up logging
app.use(morgan('tiny'));

// Connect API Routes
app.use('/api', api);

// Register services
app.use('/services', services);

// Create static server
app.use('/static', express.static(path.join(__dirname, 'static')));

// Set up Handlebars
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultView: 'main',
  layoutsDir: `${__dirname}/views/layouts/`,
  partialsDir: `${__dirname}/views/partials/`,
}));

// Initialize Session
app.use(session({
  secret: 'deadb3efbadc0de',
  resave: false,
  saveUninitialized: true,
}));


// Connect client routes
app.use(client);

// Test Handlebars
app.get('/', (req, res) => res.redirect('/home'));

const port = process.env.port || 8080;

app.listen(port, () => console.log(`💻 :: \
Server listening on ${chalk.blue(`http://${ip.address()}:${port}`)} ...`));
