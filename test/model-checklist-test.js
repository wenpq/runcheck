var debug = require('debug')('runcheck:test');
var assert = require('power-assert');
var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SchemaTypes = Schema.Types;

var deviceChecklist = require('../models/checklist').deviceChecklistSchema;
debug('the device checklist schema is: ' + util.inspect(deviceChecklist, false, null));

describe('model/checklist', function () {
  describe('#deviceChecklist', function () {
    it('DO is mandatory, and no AM', function () {
      debug(deviceChecklist.path('DO'));
      assert.ok(deviceChecklist.path('DO.value') instanceof SchemaTypes.String);
      assert.equal(deviceChecklist.path('DO.required'), undefined);
      assert.equal(deviceChecklist.path('AM'), undefined);
    });
  });
});
