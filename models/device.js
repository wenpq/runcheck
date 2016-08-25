var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var checklist = require('./checklist').deviceChecklistSchema;

var device = new Schema({
  serialNo: {
    type: String,
    index: true,
    unique: true
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
  },
  installToDevice: ObjectId,
  installToSlot: ObjectId,
  /**
   * 0: spare
   * 1: prepare to install
   * 1.5: prepare installation checklist
   * 2: approved to install
   * 3: installed
   */
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 1.5, 2, 3]
  }
});

var Device = mongoose.model('Device', device);

module.exports = {
  Device: Device
};
