'use strict';

/**
 * Module dependencies.
 */
const { check, validationResult } = require('express-validator/check');
const auth = require('../app/controllers/authentication');

/**
 * Expose
 * app is an instance from express()
 * connect is an instance from mongoDB connection
 */

module.exports = function (app, connect) {
  // app.use(require('connect-flash')());
  // app.use(function (req, res, next) {
  //   res.locals.messages = require('express-messages')(req, res);
  //   next();
  // });

  app.get('/', auth.index);

   
  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
