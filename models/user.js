var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/*******
 * adid: use id from AD converted to lower case
 * name: full name
 * lastLoginOn: latest login time
 * roles: Leader: the leader of a group or a subject; Admin: the admin of the
 * application
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
  roles: [{
    type: String,
    lowercase: true,
    enum: ['leader', 'admin']
  }],
  lastLoginOn: Date
});

var User = mongoose.model('User', user);
module.exports = {
  User: User
};
