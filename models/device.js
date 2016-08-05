var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var checklistValues = ['N', 'Y', 'YC']
var checklistSubjects = ['DO', 'EE', 'ME', 'CRYO', 'CTRLS', 'PHYS', 'ESHQ', 'AM']

/*******
 * A ChecklistItem is a element of a checklist. 
 * subject: name of the subject (ie department)
 * required: indicate if approval is required
 * value: indicate state of this item
 * comment: extra information
 *******/
var checklistItem = new Schema({
  subject: {
    type: String,
    enum: checklistSubjects
  },
  required: {
    type: Boolean,
    default: true
  },
  value: {
    type: String,
    enum: checklistValues,
    default: checklistValues[0],
  },
  comment: {
    type: String,
    default: ''
  }
});


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
  checklist: [checklistItem],
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
  Device: Device,
  checklistValues: checklistValues,
  checklistSubjects: checklistSubjects
};