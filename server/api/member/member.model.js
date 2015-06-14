'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MemberHighestPosSchema = require('./memberHighestPos.model.js');

var MemberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: false,
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


MemberSchema.pre('save', function(next) {
  var member = this;
  if (member.position) return next();

  MemberHighestPosSchema.findOneAndUpdate({}, { $inc: { highestPos: 1 } }, function (err, highestPos) {
    if (err) next(err);
    member.position = highestPos.highestPos - 1;
    next();
  });
});

module.exports = mongoose.model('Member', MemberSchema);
