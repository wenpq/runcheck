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
  var slotDocs = [];
  Slot.find(function (err, docs) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    var count = 0;
    // data just for test.
    docs.forEach(function(d) {
      var slotDoc = {
        _id: d._id,
        name: d.name,
        owner: 'wen',
        area: 'unknow in xlsx',
        level: d.level,
        deviceType: d.deviceType,
        location: [d.coordinateX, d.coordinateY, d.coordinateZ],
        device: d.device,
        approvalStatus: 'unknow in xlsx',
        machineMode: 'unknow in xlsx',
        ReadinessCheckedValue: 10,
        ReadinessTotalValue: 10,
        DRRCheckedValue: 4,
        DRRTotalValue: 10,
        ARRCheckedValue: 0,
        ARRTotalValue:10
      };
      slotDocs.push(slotDoc);
      count = count + 1;
      if(count === docs.length) {
        res.status(200).json(slotDocs);
      }
    });
  });
});


slots.get('/:id', auth.ensureAuthenticated, function (req, res) {
  Slot.findOne({_id: req.params.id },function(err, slot) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    SlotGroup.findOne({_id: slot.inGroup },function(err, slotGroup) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      res.render('slot',{
        slot: slot,
        slotGroup: slotGroup
      });
    });
  });
});


slots.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  Slot.findOne({_id: req.params.id },function(err, doc) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).send(doc);
  });
});


slots.get('/json/names', auth.ensureAuthenticated, function (req, res) {
  Slot.find({}, {name: true, _id: false}, function (err, docs) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    return res.status(200).json(docs);
  });
});

module.exports = slots;
