var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var device = new Schema({
  serialNo: String,
  name: String,
  type: String,
  department: String,
  owner: ObjectId,
  details: ObjectId,
  checklist: ObjectId,
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

module.exports = {
  device: device
};