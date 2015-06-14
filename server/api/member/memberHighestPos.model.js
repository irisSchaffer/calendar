'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemberHighestPosSchema = new Schema({
  highestPos: { type: Number, default: 1 }
});

module.exports = mongoose.model('MemberHighestPos', MemberHighestPosSchema);
