var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var addHistory = require('./history').addHistory;

var checklistValues = ['N', 'Y', 'YC'];
var subjects = ['EE', 'ME', 'CRYO', 'CTRLS', 'PHYS', 'ESHQ'];
var deviceChecklistSubjects = subjects.concat('DO');
var drrChecklistSubjects = ['DO'].concat(subjects).concat('AM');
var arrChecklistSubjects = ['DO'].concat(subjects).concat('AM');

/*******
 * A checklistItem is the configuration information for an item in a checklist.
 * name: unique identifier for the item within the checklist
 * subject: title of the item that is displayed to the user
 * assignee: user id of person required to respond to this item
 * required: indicate if the item must have a response
 * mandatory: (virtual) indicate if the item must be required
 * custom: (virtual) indicate if the item is user created
 *******/
var checklistItem = Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  assignee: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: true
  }
});

checklistItem.virtual('mandatory').get(function () {
  return (subjects.indexOf(this.name) === -1);
});

checklistItem.virtual('custom').get(function () {
  return (subjects.indexOf(this.name) === -1)
          && (['DO', 'AM'].indexOf(this.name) === -1);
});

/*******
 * A checklistInput is the response for a checklist item.
 * name: unique identifier for the item to which this input belongs
 * value: the value of the input
 * comment: extra information
 * inputOn: date when the input was submitted
 * inputBy: user id of the persion who submitted the input
 *******/
var checklistInput = Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    enum: checklistValues,
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  inputOn: {
    type: Date,
    required: true
  },
  inputBy: {
    type: String,
    required: true
  }
});


/*******
 * A checklist is a list of responses for various subjects
 * items: list of checklist items
 * input: list of checklist inputs
 */
var checklist = Schema({
  items: [checklistItem],
  inputs: [checklistInput]
});

checklist.plugin(addHistory, {
  fieldsToWatch: ['items']
});


var Checklist = mongoose.model('Checklist', checklist);


var defaultDeviceChecklist = { items: [] };
deviceChecklistSubjects.forEach(function (s) {
  defaultDeviceChecklist.items.push({
    name: s,
    subject: s
  });
});

var defaultDRRChecklist = { items: [] };
drrChecklistSubjects.forEach(function (s) {
  defaultDRRChecklist.items.push({
    subject: s
  });
});

var defaultARRChecklist = { items: [] };
arrChecklistSubjects.forEach(function (s) {
  defaultARRChecklist.items.push({
    subject: s
  });
});


module.exports = {
  checklistValues: checklistValues,
  deviceChecklistSubjects: deviceChecklistSubjects,
  drrChecklistSubjects: drrChecklistSubjects,
  arrChecklistSubjects: arrChecklistSubjects,
  defaultDeviceChecklist: defaultDeviceChecklist,
  defaultDRRChecklist: defaultDRRChecklist,
  defaultARRChecklist: defaultARRChecklist,
  Checklist: Checklist
};
