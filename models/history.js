var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;

var log = require('../lib/log');

var _ = require('underscore');

/**********
 * p: the property of an object
 * v: the change-to value of the property
 **********/
var change = new Schema({
  p: {
    type: String,
    required: true
  },
  v: {
    type: Mixed,
    required: true
  }
});


/**********
 * a: at, the date of the history
 * b: by, the author of the history
 * k: kind, the object's kind
 * i: id, the object's id
 * c: the array of changes
 **********/
var history = new Schema({
  a: {
    type: Date,
    required: true,
    default: Date.now()
  },
  b: {
    type: Date,
    required: true
  },
  t: {
    type: String,
    required: true
  },
  i: {
    type: ObjectId,
    refPath: 't',
    required: true
  },
  c: [change]
});

var History = mongoose.model('History', history);

function handleErr(err, cb) {
  if (err) {
    log.error(err);
    if (cb && _.isFunction(cb)) {
      cb(err);
    }
  }
}

function addHistory(schema, options) {
  options = options || {};
  if (options.watchAll === true) {
    options.fieldsToWatch = schema.paths.getOwnPropertyNames();
  }
  options.fieldsToWatch = _([])
    .chain()
    .concat(options.fieldsToWatch)
    .reject(function (field) {
      return _(['__updates', '_id']).contains(field)
    })
    .valueOf();

  schema.add({
    __updates: [ObjectId]
  });

  schema.methods.saveWithHistory = function (userid, cb) {
    var doc = this;
    var c = [];
    var h;
    if (doc.isModified()) {
      options.fieldsToWatch.forEach(function (field) {
        if ((doc.isNew && doc.get(field)) || doc.isModified(field)) {
          c.push({
            p: field,
            v: doc.get(field)
          });
        }
      });
      if (c.length > 0) {
        h = new History({
          a: Date.now(),
          b: userid,
          c: c,
          t: this.schemaName,
          i: this._id
        });
        h.save(function (err, historyDoc) {
          if (err) {
            return handleErr(err, cb);
          }
          doc.__updates.push(historyDoc._id);
          doc.save(function (err, newDoc) {
            if (err) {
              return handleErr(err, cb);
            }
            return cb(err, newDoc);
          })
        });
      }

    }
  };

}


module.exports = {
  History: History,
  addHistory: addHistory
};
