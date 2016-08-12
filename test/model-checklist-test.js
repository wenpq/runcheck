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
    it('has DO and no AM', function () {
      debug(deviceChecklist.path('DO.required'));
      assert.ok(deviceChecklist.path('DO.required') instanceof SchemaTypes.Boolean);
      assert.equal(deviceChecklist.path('AM.required'), undefined);
    });
  });
});
