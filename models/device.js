var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


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
  irrChecklist: {
    id: ObjectId,
    required: {
      type: Boolean,
      default: false
    }
  },
  irrApproval: {
    status: {
      type: String,
      default: ''
    },
    comment: {
      type: String,
      default: ''
    }
  },
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
