var express = require('express');
var slots = express.Router();
var auth = require('../lib/auth');
var Slot = require('../models/slot').Slot;
var SlotGroup = require('../models/slot-group').SlotGroup;
var log = require('../lib/log');

slots.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slots');
});

slots.get('/json', auth.ensureAuthenticated, function (req, res) {
  Slot.find(function (err, docs) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    // data just for test.
    var slotDocs = docs.map(function (s) {
      return {
        _id: s._id,
        name: s.name,
        owner: 'wen',
        area: 'unknow in xlsx',
        level: s.level,
        deviceType: s.deviceType,
        location: [s.coordinateX, s.coordinateY, s.coordinateZ],
        device: s.deviceNaming,
        approvalStatus: 'unknow in xlsx',
        machineMode: 'unknow in xlsx',
        ReadinessCheckedValue: 10,
        ReadinessTotalValue: 10,
        DRRCheckedValue: 4,
        DRRTotalValue: 10,
        ARRCheckedValue: 0,
        ARRTotalValue: 10
      }
    });
    res.status(200).json(slotDocs);
  });
});


slots.get('/:id', auth.ensureAuthenticated, function (req, res) {
  Slot.findOne({
    _id: req.params.id
  }, function (err, slot) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    SlotGroup.findOne({
      _id: slot.inGroup
    }, function (err, slotGroup) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      res.render('slot', {
        slot: slot,
        slotGroup: slotGroup
      });
    });
  });
});


slots.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  Slot.findOne({
    _id: req.params.id
  }, function (err, doc) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).send(doc);
  });
});

module.exports = slots;
