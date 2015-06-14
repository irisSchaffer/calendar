'use strict';

var express = require('express');
var controller = require('./configuration.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.show);
router.put('/', controller.update);

module.exports = router;
