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
      return res.send(401);
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

    configuration.calendarName = req.body.calendarName;
    configuration.morning = req.body.morning;
    configuration.afternoon = req.body.afternoon;
    configuration.daysPerWeek = req.body.daysPerWeek;
    configuration.save(function(err) {
      if (err) {
        return res.status(422).json(err);
      }

      res.send(200);
    });
  });
};
