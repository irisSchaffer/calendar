'use strict';

var Member = require('./member.model');
var config = require('../../config/environment');

/**
 * Get all members
 */
exports.list = function (req, res, next) {
  Member.find({}, function (err, members) {
    if(err) return res.send(500, err);

    res.json(200, members);
  });
};

/**
 * Get one member
 * @param req
 * @param res
 * @param next
 */
exports.show = function(req, res, next) {
  Member.findById(req.params.id, function (err, member) {
    if (err) return next(err);

    if (!member) return res.send(401);

    res.json(member);
  });
}

/**
 * Create a member
 * @param req
 * @param res
 * @param next
 */
exports.create = function(req, res, next) {
  var project = new Member(req.body);
  project.save(function(err, member) {
    if (err) return res.json(422, err);

    res.json(200, member);
  });
}

/**
 * Update a member
 */
exports.update = function(req, res, next) {
  Member.findById(req.params.id, function (err, member) {
    if (err) return next(err);

    member.name = req.body.name;

    member.save(function(err) {
      if (err) return res.status(400).json(err);

      res.json(200, member);
    });
  });
};

/**
 * Delete a member
 * @param req
 * @param res
 * @param next
 */
exports.destroy = function(req, res, next) {
  Member.findByIdAndRemove(req.params.id, function(err, project) {
    if(err) return res.send(500, err);

    return res.send(204);
  });
};

