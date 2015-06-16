'use strict';

var Q = require('q');
var Member = require('../member/member.model');
var Configuration = require('../configuration/configuration.model');
var Project = require('../project/project.model');
var config = require('../../config/environment');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');

/**
 * Returns array of projects' colors of form project._id: project.color
 * @param {object} req Request
 * @param {object} res Response - 500 with errors or 200 with color array on success
 */
exports.getProjectColors = function(req, res) {
  Project.find({}, function(err, projects) {
    if(err) return res.json(500, err);

    var pColors = [];
    projects.forEach(function(project) {
      pColors.push({id: project._id, color: project.color});
    });

    res.json(200, pColors);
  });
}

/**
 * Removes events and adds new ones.
 * @param {object} req Request with events in form:
 *            {[
 *              0: [ // member at position 0
 *                0: { // this week's monday
 *                  morning: xxx, // project with id xxx
 *                  afternoon: yyy // project with id yyy
 *                },
 *                1: { // this week's tuesday
 *                  morning: zzz // project with id zzz
 *                },
 *                ...
 *              ],
 *              1: ... // member at position 1
 *            ]}
 * @param {object} res Response - 500 with errors or 200 with links to the created events
 */
exports.setEvents = function(req, res) {
  Q.all([getConfig(), getProjects()])
    .spread(function (configuration, projects) {
      var promises = [];
      var morning = configuration.morning;
      var afternoon = configuration.afternoon;
      var dpw = configuration.daysPerWeek;

      var memberCalendars = req.body;
      var promise = Q(true);

      memberCalendars.forEach(function (days, index) {
        promise = promise.then(function () {
          return getMember(index + 1)
            .then(function (member) {
              var oauth2Client = getAuth(member);
              console.log("NOW HANDLING " + member.name + "'S STUFF!!");

              return findAndDeleteEvents(days.length, dpw, oauth2Client, member.calendarId)
              .then(function () {
                console.log("GOING THROUGH ALL DAYS");
                days.forEach(function (day, index) {
                  if (day.morning) {
                    promises.push(addEvent(
                      projects[day.morning],
                      getDateTime(index, dpw, morning.start),
                      getDateTime(index, dpw, morning.end),
                      oauth2Client,
                      member.calendarId
                    ));
                  }

                  if (day.afternoon) {
                    promises.push(addEvent(
                      projects[day.afternoon],
                      getDateTime(index, dpw, afternoon.start),
                      getDateTime(index, dpw, afternoon.end),
                      oauth2Client,
                      member.calendarId
                    ));
                  }
                });
              });
            });
          });
        });

      return promise.then(function() {
        return Q.all(promises);
      });
    })
    .then(function (data) {
      console.log("RETURNING 200");
      res.json(200, data);
    }, function (err) {
      console.log(err);
      res.json(500, err);
    }).done();
};

function getAuth(member) {
  var auth = new OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
  auth.setCredentials(member.credentials);

  return auth;
}

/**
 * Returns the calendar's configuration.
 *
 * @returns {deferred.promise} Rejected with an error if one occurs, resolved with the configuration
 */
function getConfig() {
  var deferred = Q.defer();
  Configuration.findOne({}, function (err, configuration) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(configuration);
    }
  });

  return deferred.promise;
}

/**
 * Returns all projects.
 *
 * @returns {deferred.promise} Rejected with an error if one occurs, resolved with the found projects
 */
function getProjects() {
  var deferred = Q.defer();
  Project.find({}, function(err, p) {
    if (err) {
      deferred.reject(err);
    } else {
      var projects = [];
      p.forEach(function(project) {
        projects[project._id] = project;
      });

      deferred.resolve(projects);
    }
  });

  return deferred.promise;
}

/**
 * Gets Member at position position
 * @param {int} position Member's position
 * @returns {deferred.promise} Rejected with error on error, else resolved with member.
 */
function getMember(position) {
  var deferred = Q.defer();
  Member.findOne({position: position}, function (err, member) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(member);
    }
  });

  return deferred.promise;
}

function findAndDeleteEvents(days, daysPerWeek, auth, calId) {
  console.log("NOW FINDIND AND DELETING EVENTS!!");

  var promises = [];
  return findEvents(days, daysPerWeek, auth, calId)
    .then(function(events) {
      console.log("NOW DELETING EVENTS!");
      events.forEach(function(event) {
        promises.push(deleteEvent(event.id, auth, calId));
      });

      return Q.all(promises);
    });
}

/**
 *
 * @param {int} days Number of days covered by calendar
 * @param {int} daysPerWeek days per week (i.e. 5 or 7)
 * @param {object} auth OAuth2 authentication
 * @param {string} calId Calendar ID
 * @returns {deferred.promise} A Promise being rejected with an error if one occurs or resolved with an array of events
 */
function findEvents(days, daysPerWeek, auth, calId) {
  console.log("NOW FINDING EVENTS");
  var deferred = Q.defer();
  var startTime = new Date(getDate(0, daysPerWeek));
  startTime.setHours(0, 0);

  var endTime = new Date(getDate(days, daysPerWeek));
  endTime.setHours(0, 0);

  calendar.events.list({
    auth: auth,
    calendarId: calId,
    timeMin: startTime.toISOString(),
    timeMax: endTime.toISOString()
  }, function(err, events) {
    if(err) {
      deferred.reject(err);
    } else {
      deferred.resolve(events.items);
    }
  });

  return deferred.promise;
}

/**
 * Deletes event with id eventId in the calendar of id calId using auth as authentication
 * @param {int} eventId ID of event
 * @param {object} OAuth2 authentication object
 * @param {string} calId Calendar ID
 * @returns {deferred.promise} A Promise being rejected with an error if one occurs or resolved if the event is deleted
 */
function deleteEvent(eventId, auth, calId) {
  var deferred = Q.defer();

  calendar.events.delete({
    auth: auth,
    calendarId: calId,
    eventId: eventId
  }, function(err) {
    if(err) {
      console.log('couldnt remove ' + eventId);

      deferred.reject(err);
    } else {
      console.log('removed ' + eventId);
      deferred.resolve();
    }
  });
}

/**
 * Adds an event for project from start to end time with the provided auth into the calendar of id calId
 * @param {object} project Project object, its name is used as event description
 * @param {string} start ISO representation of start date + time
 * @param {string} end ISO representation of end date + time
 * @param {object} OAuth2 authentication
 * @param {string} calId Calendar ID of the calendar the event should be inserted into
 * @returns {deferred.promise} A Promise being rejected with an error, if one occurs or resolved with the created event's link
 */
function addEvent(project, start, end, auth, calId) {
  var deferred = Q.defer();

  var event = {
    'summary': project.name,
    'start': {
      'dateTime': start,
      'timeZone': config.timeZone
    },
    'end': {
      'dateTime': end,
      'timeZone': config.timeZone
    },
    'reminders': {
      'useDefault': false
    },
  };

  calendar.events.insert({
    auth: auth,
    calendarId: calId,
    resource: event
  }, function(err, resultEvent) {
    if (err) {
      console.log('calender insert err', err);
      console.log('calender insert event', event);
      console.log('calender insert auth', auth);
      console.log('calender insert calId', calId);
      deferred.reject(err);
    } else {
      console.log('calender insert succ', resultEvent);

      deferred.resolve(resultEvent);
    }
  });

  return deferred.promise;
}

/**
 * Calculates date of a given index and the daysPerWeek
 * @param {int} index Index of day
 * @param {int} daysPerWeek of days per week in the calendar (i.e. 5 or 7)
 * @returns {string} ISO representation of calculated date
 */
function getDate(index, daysPerWeek) {
  var dateTime = new Date();
  var weekDay = dateTime.getDay() || 7; // make Sunday 7 instead of 0
  var date = dateTime.getDate();

  // convert index from n-daysPerWeek base to 7-daysPerWeek base
  var weeklyIndex = index;
  if (daysPerWeek != 7) {
    weeklyIndex = Math.floor(weeklyIndex / daysPerWeek) * 7 + (weeklyIndex % daysPerWeek);
  }

  // go back to monday (date - weekday + 1) and add the index (+ weeklyIndex)
  dateTime.setDate(date - weekDay + 1 + weeklyIndex);

  return dateTime.toISOString();
}

/**
 * Calculates date and time from a given index, time and the daysPerWeek
 * @param {int} index Index of day
 * @param {int} daysPerWeek int Number of days per week in the calendar (i.e. 5 or 7)
 * @param {Date} time Date object holding the time (only hours and minutes are used)
 * @returns {String} ISO representation of calculated date
 */
function getDateTime(index, daysPerWeek, time) {
  var dateTime = new Date(getDate(index, daysPerWeek));

  // set date to hours and minutes of time
  dateTime.setHours(time.getHours(), time.getMinutes());

  return dateTime.toISOString();
}
