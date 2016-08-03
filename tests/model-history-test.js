var should = require('should');
var debug = require('debug')('runcheck:test');
var mongoose = require('mongoose');
mongoose.connection.close();
var log = require('../lib/log');

var mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: {
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};

var mongoURL = 'mongodb://localhost:27018/runcheck_test';


var User = require('../models/user').User;
var History = require('../models/history').History;
var plugin = require('../models/history').addHistory;

// function cleanDB(done) {
//   db.connection.db.dropDatabase(function (err) {
//     err.should.not.exist();
//     done();
//   })
// }

// function handleErr(err, done) {
//   log.error(err);
//   done(err);
// }


describe('model/history', function () {
  this.timeout(15 * 1000);
  before(function (done) {
    mongoose.connect(mongoURL, mongoOptions, function (err) {
      if (err) {
        done(err);
      }
      log.info('conn ready:  ' + mongoose.connection.readyState);
      User.remove({}, function (userErr) {
        if (userErr) {
          done(userErr);
        }
        done();
      })
    });
  });

  after(function (done) {
    mongoose.disconnect(done);
  });

  describe('#addHistory()', function () {
    it('has no history field and method before add', function (done) {
      var user = new User({
        adid: 'test',
        name: 'test user'
      });
      user.save(function (err, newUser) {
        should.not.exist(err);
        should.not.exist(newUser.get('__update'));
        done();
      });
    });

    it('gets history field and method after plugin', function (done) {
      User.schema.plugin(plugin);
      User.findOne({adid: 'test'}, function (err, user) {
        if (err) {
          done(err);
        }
        should.exist(user);
        user.get('__updates').should.be.Array;
        done();
      });
    });
  });
});
