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

/*
 return json data:
 {
   passDataId: // slot Ids can be removed
   conflictDataName: {
     slot: // conflict slot name
     conflictGroup:// conflict slot group name
   }
   groupOption:
 }
 */
slots.post('/removeGroupValidate',auth.ensureAuthenticated, function (req, res) {
  var passDataId = [];
  var conflictDataName = [];
  var count = 0;
  // validate slot
  Slot.find({
    '_id': {$in: req.body.slotIds}
  }, function (err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    docs.forEach(function (d) {
      if (d.inGroup) {
        passDataId.push(d._id);
      } else {
        conflictDataName.push({
          slot: d.name
        });
      }
      count = count + 1;
      if (count === docs.length) {
        res.status(200).json({
          passDataId: passDataId,
          conflictDataName: conflictDataName
        });
      }
    });
  });
});

slots.post('/removeGroup',auth.ensureAuthenticated, function (req, res) {
  // delete items in inGroup field of slot
  Slot.update({ '_id': {$in: req.body.slotIds}}, {inGroup: null}, {multi: true}, function(err) {
    if(err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    // delete specified slots of slotGroup
    SlotGroup.find(function(err, docs){
      if(err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      var count = 0;
      docs.forEach(function(slotGroup) {
        slotGroup.slots = slotGroup.slots.filter(function (x) {
          return req.body.slotIds.indexOf(String(x)) === -1;
        });
        slotGroup.save(function(err) {
          if (err) {
            console.error(err);
            return res.status(500).send(err.message);
          }
          count = count + 1;
          if (count === docs.length) {
            res.status(200).end();
          }
        })
      });
    });
  });
});

module.exports = slots;
