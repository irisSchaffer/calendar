'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  calendarId: {
    type: String,
    required: true
  },
  accessData: {
    accessToken: String,
    refreshToken: String
  }
});

MemberSchema.path('name').validate(function(value, respond) {
  var self = this;
  this.constructor.findOne({name: value}, function(err, member) {
    if(err) throw err;
    if(member) {
      if(self.id === member.id) return respond(true);
      return respond(false);
    }
    respond(true);
  });
}, 'You already have a team member of that name.');



module.exports = mongoose.model('Project', ProjectSchema);
