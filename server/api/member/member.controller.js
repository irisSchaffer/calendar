'use strict';

var Member = require('./member.model');
var config = require('../../config/environment');

/**
 * Get all members
 */
exports.list = function (req, res, next) {
  Member.find({}).sort({position : 'asc'}).exec(function (err, members) {
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
 * Update a member
 */
exports.update = function(req, res, next) {
  var member = {
    name: req.body.name,
    position: req.body.position
  };

  Member.update({_id: req.params.id}, member, {}, function(err, affRows) {
    console.log(err, affRows);
    if (err) return res.status(400).json(err);

    res.json(200);
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

