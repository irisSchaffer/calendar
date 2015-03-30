'use strict';

var Configuration = require('./configuration.model');
var config = require('../../config/environment');

/**
 * Get config
 */
exports.show = function (req, res, next) {
  Configuration.findOne({}, function (err, config) {
    if (err) {
      return next(err);
    }

    if (!config) {
      return res.status(400).send();
    }

    res.json(config);
  });
};

/**
 * Update config
 */
exports.update = function(req, res, next) {
  Configuration.findOne({}, function (err, configuration) {
    if (err) {
      return next(err);
    }

    configuration.daysPerWeek = req.body.daysPerWeek;
    configuration.save(function(err) {
      if (err) {
        return res.status(400).json(err);
      }

      res.send(200);
    });
  });
};