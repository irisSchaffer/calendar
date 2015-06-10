'use strict';

var Project = require('./project.model');
var config = require('../../config/environment');

/**
 * Get all projects
 */
exports.list = function (req, res, next) {
  Project.find({}, function (err, projects) {
    if(err) return res.send(500, err);

    res.json(200, projects);
  });
};

/**
 * Get one project
 * @param req
 * @param res
 * @param next
 */
exports.show = function(req, res, next) {
  Project.findById(req.params.id, function (err, project) {
    if (err) return next(err);

    if (!project) return res.send(401);

    res.json(project);
  });
}

/**
 * Create a project
 * @param req
 * @param res
 * @param next
 */
exports.create = function(req, res, next) {
  var project = new Project(req.body);
  project.save(function(err, project) {
    if (err) return res.json(422, err);

    res.json(200, project);
  });
}

/**
 * Update a project
 */
exports.update = function(req, res, next) {
  Project.findById(req.params.id, function (err, project) {
    if (err) return next(err);

    project.color = req.body.color;
    project.name = req.body.name;

    project.save(function(err) {
      if (err) return res.status(400).json(err);

      res.json(200, project);
    });
  });
};

/**
 * Delete a project
 * @param req
 * @param res
 * @param next
 */
exports.destroy = function(req, res, next) {
  Project.findByIdAndRemove(req.params.id, function(err, project) {
    if(err) return res.send(500, err);

    return res.send(204);
  });
};

