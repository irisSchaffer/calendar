'use strict';

var express = require('express');
var controller = require('./calendar.controller');

var router = express.Router();

router.get('/', controller.getProjectColors);
router.post('/', controller.setEvents);

module.exports = router;
