'use strict';

/**
 * Module dependencies
 */

require('dotenv').config();

const fs              = require('fs');
const join            = require('path').join;
const express         = require('express');
const session         = require('express-session');
const expressMessage  = require('express-messages');
const mongoose        = require('mongoose');
const passport        = require('passport');
const models          = join(__dirname, 'app/models');
const app             = express();
const connection      = connect();
const compression     = require('compression');
const morgan          = require('morgan');
const cookieParser    = require('cookie-parser');
const cookieSession   = require('cookie-session');
const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');
const csrf            = require('csurf');
const flash           = require('connect-flash');
// const flash           = require('express-flash-messages')
const winston         = require('winston');
const helpers         = require('view-helpers');
const pug             = require('pug');
const pkg             = require('./package.json');
const env             = process.env.NODE_ENV || 'development';
const port            = process.env.PORT || 3000;

/**
 * Expose
 */

// Compression middleware (should be placed before express.static)
app.use(compression({
  threshold: 512
}));

// Static files middleware
app.use(express.static('./public'));

// Use winston on production
var log;
if (env !== 'development') {
  log = {
    stream: {
      write: function (message, encoding) {
        winston.info(message);
      }
    }
  };
} else {
  log = 'dev';
}

// Don't log during tests
// Logging middleware
if (env !== 'test') app.use(morgan(log));

// set views path and default layout
app.set('views', './app/views');
app.set('view engine', 'pug');

// expose package.json to views
app.use(function (req, res, next) {
  res.locals.pkg = pkg;
  res.locals.env = env;
  next();
});

// bodyParser should be above methodOverride
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// cookieParser should be above session
app.use(cookieParser());
app.use(cookieSession({ secret: 'secret' }));


// connect flash for flash messages - should be declared after sessions
app.use(flash());

// should be declared after session and flash
app.use(helpers(pkg.name));

// setup express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));


// adds CSRF support
if (process.env.NODE_ENV !== 'test') {
  app.use(csrf());

  // This could be moved to view-helpers :-)
  app.use(function (req, res, next){
    res.locals.csrf_token = req.csrfToken();
    next();
  });
}


connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);


require('./config/route')(app, connect);


// ExpressJS Port Listener
function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

// MongoDB Connection starter
function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  var connection = mongoose.connect('mongodb://localhost/drone', options).connection;
  return connection;
}
