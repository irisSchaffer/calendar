'use strict';

var express = require('express');
var controller = require('./member.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
