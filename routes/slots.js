var express = require('express');
var slots = express.Router();
var auth = require('../lib/auth');
var Slot = require('../models/slot').Slot;
var SlotGroup = require('../models/slot-group').SlotGroup;

slots.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slots');
});

slots.get('/json', auth.ensureAuthenticated, function (req, res) {
  var slotDocs = [];
  Slot.find(function (err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    var count = 0;
    // data just for test.
    docs.forEach(function(d) {
      var slotDoc = {
        details: d._id,
        name: d.name,
        owner: 'wen',
        area: 'unknow in xlsx',
        level: d.level,
        deviceType: d.deviceType,
        location: [d.coordinateX, d.coordinateY, d.coordinateZ],
        device: d.deviceNaming,
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

slots.post('/addGroupValidate',auth.ensureAuthenticated, function (req, res) {
  var passDataId = [];
  var rejectDataName = [];
  var count = 0;
  Slot.find({
    '_id': {$in: req.body.slotIds}
  }, function (err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    docs.forEach(function (d) {
      if (d.inGroup) {
        rejectDataName.push(d.name);
      } else {
        passDataId.push(d._id);
      }
      count = count + 1;
      if (count === docs.length) {
        res.status(200).json({
          passDataId: passDataId,
          rejectDataName: rejectDataName
        });
      }
    });
  });
});


slots.post('/addGroup',auth.ensureAuthenticated, function (req, res) {
  // find slotGroup id by name
  SlotGroup.find({'name': req.body.slotGroupName}, function(err, slotGroup){
    if(err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    // save id
    Slot.update({ '_id': {$in: req.body.slotIds}
    }, {
      inGroup: slotGroup[0]._id
    }, function(err) {
      if(err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      res.status(200).end();
    })
  });
});

module.exports = slots;
