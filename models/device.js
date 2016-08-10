var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var checklist = require('./checklist').deviceChecklistSchema;


var device = new Schema({
  serialNo: {
    type: String,
    index: {
      unique: true
    }
  },
  name: String,
  type: String,
  department: String,
  owner: String,
  details: ObjectId,
  checklist: checklist,
  checkedValue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  }
});

var Device = mongoose.model('Device', device);

module.exports = {
  Device: Device
};
