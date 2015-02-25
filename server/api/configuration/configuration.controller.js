'use strict';

var Configuration = require('./configuration.model');
var config = require('../../config/environment');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get config
 */
exports.show = function (req, res, next) {
  Configuration.findOne({}, function (err, config) {
    if (err) return next(err);
    if (!config) return res.send(401);
    res.json(config);
  });
};

/**
 * Update config
 */
exports.update = function(req, res, next) {
  console.log(req);
  Configuration.findOne({}, function (err, config) {
    if (err) return next(err);

    config.save(function(err) {
      if (err) return validationError(res, err);
      res.send(200);
    });
  });
};