'use strict';

var express = require('express');
var router = express.Router();
var Member = require('../member/member.model');
var Configuration = require('../configuration/configuration.model');
var config = require('../../config/environment');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);

router.get('/', function(req, res, next) {
  var name = req.query.name;
  var scopes = [config.google.calendarScope];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' (gets refresh_token)
    scope: scopes,
    state: name,
  });

  res.statusCode = 302;
  res.setHeader('Location', url);
  res.setHeader('Content-Length', '0');
  res.end();
});

router.get('/callback', function(req, res, next) {
  var code = req.query.code;
  var name = JSON.parse(req.query.state);

  oauth2Client.getToken(code, function (err, tokens) {
    if (err) return redirectError(err, res, name);

    oauth2Client.setCredentials(tokens);

    Configuration.findOne({}, function (err, configuration) {
      if (err) return redirectError(err, res, name);

      var calendar = google.calendar('v3');

      var newCal = {
        summary: configuration.calendarName,
        timeZone: config.timeZone
      };

      calendar.calendars.insert({
        auth: oauth2Client,
        resource: newCal
      }, function (err, cal) {
        if (err) return redirectError(err, res, name);

        var member = new Member({
          name: name,
          calendarId: cal.id
        });

        member.credentials = tokens;

        member.save(function(err, member) {
          if (err) {
            return redirectError(err, res, name);
          }

          return res.redirect(getRedirectionUrl(name) + '&success=true')
        });
      });
    });
  });
});

var redirectError = function(err, res, name) {
  return res.redirect(getRedirectionUrl(name) + '&success=false');
}

var getRedirectionUrl = function(name) {
  return '/members?name=' + name;
}


module.exports = router;
