var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var device = new Schema({
  serialNo: String,
  name: String,
  type: String,
  department: String,
  owner: String,
  details: ObjectId,
  checklist: Mixed,
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