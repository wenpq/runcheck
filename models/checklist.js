var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var checklistValues = ['N', 'Y', 'YC'];
var subjects = ['EE', 'ME', 'CRYO', 'CTRLS', 'PHYS', 'ESHQ'];
var deviceChecklistSubjects = subjects.concat('DO');
var drrChecklistSubjects = ['DO'].concat(subjects).concat('AM');
var arrChecklistSubjects = ['DO'].concat(subjects).concat('AM');

/*******
 * A ChecklistItem is the value of an subject in a checklist.
 * required: indicate if approval is required
 * value: indicate state of this item
 * comment: extra information
 *******/
var checklistItem = {
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
};

var deviceChecklist = {
  required: {
    type: Boolean,
    default: false
  }
};
deviceChecklistSubjects.forEach(function (s) {
  deviceChecklist[s] = checklistItem;
})

var deviceChecklistSchema = new Schema(deviceChecklist);

var drrChecklist = {};
drrChecklistSubjects.forEach(function (s) {
  drrChecklist[s] = checklistItem;
})

var drrChecklistSchema = new Schema(drrChecklist);


var arrChecklist = {};
arrChecklistSubjects.forEach(function (s) {
  arrChecklist[s] = checklistItem;
})

var arrChecklistSchema = new Schema(arrChecklist);


module.exports = {
  checklistValues: checklistValues,
  deviceChecklistSubjects: deviceChecklistSubjects,
  drrChecklistSubjects: drrChecklistSubjects,
  arrChecklistSubjects: arrChecklistSubjects,
  subjects: subjects,
  deviceChecklistSchema: deviceChecklistSchema,
  drrChecklistSchema: drrChecklistSchema,
  arrChecklistSchema: arrChecklistSchema
};
