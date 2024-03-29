/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/configuration', require('./api/configuration'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/members', require('./api/member'));
  app.use('/api/calendar', require('./api/calendar'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
