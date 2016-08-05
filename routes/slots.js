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
  // find slot groups
  SlotGroup.find(function(err, groupOption) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    // validate slot
    Slot.find({
      '_id': {$in: req.body.slotIds}
    }, function (err, docs) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      // divied two parts by inGroup field
      var rejectData = [];
      docs.forEach(function (d) {
        if (d.inGroup) {
          rejectData.push(d);
        } else {
          passDataId.push(d._id);
        }
      });

      if(rejectData.length > 0) {
        rejectData.forEach(function (r) {
          SlotGroup.findOne({'_id': r.inGroup}, function(err, conflictGroup) {
            rejectDataName.push({
              slot: r.name,
              conflictGroup: conflictGroup.name
            });
            count = count + 1;
            if (count === rejectData.length) {
              res.status(200).json({
                passDataId: passDataId,
                rejectDataName: rejectDataName,
                groupOption: groupOption
              });
            }
          });
        });
      }else {
        res.status(200).json({
          passDataId: passDataId,
          rejectDataName: rejectDataName,
          groupOption: groupOption
        });
      }
    });
  });
});


slots.post('/addGroup',auth.ensureAuthenticated, function (req, res) {
  // change slots of slotGroup
  SlotGroup.findOne({'name': req.body.slotGroupName}, function(err, slotGroup){
    if(err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    slotGroup.slots = slotGroup.slots.concat(req.body.slotIds);// concat array
    slotGroup.save(function(err) {
      if(err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      // change inGroup of slot
      Slot.update({ '_id': {$in: req.body.slotIds}}, {inGroup: slotGroup._id}, {multi: true}, function(err,docs) {
        if(err) {
          console.error(err);
          return res.status(500).send(err.message);
        }
        res.status(200).end();
      })
    });
  });
});

module.exports = slots;
