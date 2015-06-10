'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  color: {
    type: String,
    required: true,
    uppercase: true,
    match: [
      /^#[0-9A-F]{6}$/,
      "The value {VALUE} is not a valid color."
    ]
  },
  name: {
    type: String,
    required: true,
  }
});

ProjectSchema.path('color').validate(function(value, respond) {
  var self = this;
  this.constructor.findOne({color: value}, function(err, project) {
    if(err) throw err;
    if(project) {
      if(self.id === project.id) return respond(true);
      return respond(false);
    }
    respond(true);
  });
}, 'The specified color is already in use.');

ProjectSchema.path('name').validate(function(value, respond) {
  var self = this;
  this.constructor.findOne({name: value}, function(err, project) {
    if(err) throw err;
    if(project) {
      if(self.id === project.id) return respond(true);
      return respond(false);
    }
    respond(true);
  });
}, 'The specified project name is already taken.');

module.exports = mongoose.model('Project', ProjectSchema);
