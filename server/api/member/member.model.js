'use strict';

var Q = require('q');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/environment');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');

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
    refreshToken: String,
    expiryDate: Date
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

MemberSchema.virtual('credentials').get(function () {
  return {
    access_token: this.accessData.accessToken,
    refresh_token: this.accessData.refreshToken,
    expiry_date: this.accessData.expiryDate ? this.accessData.expiryDate : true
  };
}).set(function(googleResponse) {
  this.accessData.accessToken = googleResponse.access_token;
  this.accessData.refreshToken = googleResponse.refresh_token;
  this.accessData.expiryDate = googleResponse.expiry_date;
});


MemberSchema.pre('save', function(next) {
  var member = this;
  if (member.position) return next();

  this.constructor.count({}, function(err, c) {
    if(err) return next(err);

    member.position = c + 1;
    next();
  });
});

MemberSchema.post('remove', function() {
  var oauth2Client = new OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
  oauth2Client.setCredentials(this.credentials);
  oauth2Client.revokeCredentials(function(err) {
    if (err) throw new Error(err);
  });

  this.constructor.find({}, function(err, members) {
    if(err) throw new Error(err);

    members.forEach(function(member, index) {
      member.position = index + 1;
      member.save(function(err, member) {
        if(err) throw new Error(err);
      });
    });

  });
});

module.exports = mongoose.model('Member', MemberSchema);
