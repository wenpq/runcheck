var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*******
 * A subject is a unit or a cross-unit topic, and the leader has its
 * authorization. The admin maintains it for the authorization control.
 * name: the short name
 * fullName: the long name
 * leader: the leader's AD id
 *******/
var subject = new Schema({
  name: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  leader: {
    type: String,
    lowercase: true,
    trim: true
  }
});

var Subject = mongoose.model('Subject', subject);
module.exports = {
  Subject: Subject
};
