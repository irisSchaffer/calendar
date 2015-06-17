'use strict';

var Member = require('./member.model');
var config = require('../../config/environment');

/**
 * Get all Members
 * @param req Request
 * @param res Response - 500 + error on error, 200 + members on success
 */
exports.list = function (req, res) {
  Member.find({}).sort({position : 'asc'}).exec(function (err, members) {
    if(err) return res.send(500, err);

    res.json(200, members);
  });
};

/**
 * Get one member
 * @param req Request
 * @param res Response 401 if no member is found, 200 + member on success
 * @param next Next request handler, called if db error occurs
 */
exports.show = function(req, res, next) {
  Member.findById(req.params.id, function (err, member) {
    if (err) return next(err);

    if (!member) return res.send(401);

    res.json(200, member);
  });
}

/**
 * Update a member
 * @param {object} req Request
 * @param {object} res Response - 400 + error on error, 200 on success
 */
exports.update = function(req, res) {
  var member = {
    name: req.body.name,
    position: req.body.position
  };

  Member.update({_id: req.params.id}, member, {}, function(err) {
    if (err) return res.status(400).json(err);

    res.json(200);
  });
};

/**
 * Delete a member and reovke his access token to this app.
 * @param {object} req Request
 * @param {object} res Response - 401 + error if no member is found, 204 on success
 * @param {object} next Next Request listener called on server errors
 */
exports.destroy = function(req, res, next) {
  Member.findByIdAndRemove(req.params.id, function(err, member) {
    if(err) return next(err);

    if (!member) return res.send(401);

    // this call is necessary so the post-remove hook fires.
    member.remove();
    res.send(204);
  });
};

