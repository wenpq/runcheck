var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var addHistory = require('./history').addHistory;

var subjects = require('./device').subjects;


/*******
 * adid: use id from AD converted to lower case
 * name: full name
 * lastLoginOn: latest login time
 * roles: leader: the leader of a group or a subject; admin: the admin of the
 * application
 * expert: the subject matter, the default is undefined. Set to undefined to
 * remove.
 *******/
var user = new Schema({
  adid: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: String,
  email: String,
  office: String,
  phone: String,
  mobile: String,
  roles: {
    admin: {
      type: Boolean,
      default: false
    },
    leader: {
      type: Boolean,
      default: false
    }
  },
  expert: {
    type: String,
    enum: subjects
  },
  lastLoginOn: Date
});

user.plugin(addHistory, {
  fieldsToWatch: ['roles.admin', 'roles.leader', 'subject']
});

var User = mongoose.model('User', user);
module.exports = {
  User: User,
  userSchema: user
};
