'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var ConfigurationSchema = new Schema({
  calendarName: {
    type: String,
    default: 'lego calendar'
  },
  morning: {
    start: Date,
    end: Date
  },
  afternoon: {
    start: Date,
    end: Date
  },
  daysPerWeek: {
    type: Number,
    default: 5
  }
});

ConfigurationSchema.path('daysPerWeek').validate(function(val) {
  return val == 5 || val == 7;
}, 'Days per week must be either 5 or 7.');

module.exports = mongoose.model('Configuration', ConfigurationSchema);
