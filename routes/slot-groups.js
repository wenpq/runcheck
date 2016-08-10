var express = require('express');
var slotGroups = express.Router();
var auth = require('../lib/auth');
var SlotGroup = require('../models/slot-group').SlotGroup;
var Slot = require('../models/slot').Slot;

slotGroups.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slot-groups');
});


slotGroups.get('/json', auth.ensureAuthenticated, function (req, res) {
  SlotGroup.find(function(err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).json(docs);
  });
});


slotGroups.get('/:id', auth.ensureAuthenticated, function (req, res) {
  res.render('slot-group');
});

slotGroups.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  SlotGroup.findOne({_id: req.params.id },function(err, doc) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).json(doc);
  });
});


slotGroups.get('/:id/slots', auth.ensureAuthenticated, function (req, res) {
  SlotGroup.findOne({ _id: req.params.id },{ slots: 1, _id: 0 }, function(err, doc) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    Slot.find({ _id: {$in: doc.slots }},function(err, docs) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      res.status(200).json(docs);
    });
  });
});


/*
 Validation for adding slot to group, return json data:
 {
 passData:{ // slot Ids can be added
   id:
   name:
   }
 conflictDataName: {
    slot: // conflict slot name
    conflictGroup:// conflict slot group name
   }
 }
 */
slotGroups.post('/validateAdd', auth.ensureAuthenticated, function (req, res) {
  var passData = [];
  var conflictDataName = [];
  var count = 0;
  Slot.find({
    '_id': {$in: req.body.slotIds}
  }, function (err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    // divied two parts by inGroup field
    var conflictData = [];
    docs.forEach(function (d) {
      if (d.inGroup) {
        conflictData.push(d);
      } else {
        passData.push({id: d._id,
          name: d.name});
      }
    });

    if(conflictData.length > 0) {
      conflictData.forEach(function (r) {
        SlotGroup.findOne({'_id': r.inGroup}, function(err, conflictGroup) {
          conflictDataName.push({
            slot: r.name,
            conflictGroup: conflictGroup.name
          });
          count = count + 1;
          if (count === conflictData.length) {
            res.status(200).json({
              passData: passData,
              conflictDataName: conflictDataName
            });
          }
        });
      });
    }else {
      res.status(200).json({
        passData: passData,
        conflictDataName: conflictDataName
      });
    }
  });
});

// we need to do validation here. check if a slot id exists and the slot.inGroup is undefined. why???
function slotIdExist(req, res, next){
  next();
}
slotGroups.put('/:gid/slot/:sid', auth.ensureAuthenticated, slotIdExist, function (req, res) {
  SlotGroup.update({_id: req.params.gid}, {$addToSet: {slots: req.params.sid} }, function(err) {
    if(err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    Slot.update({_id: req.params.sid}, {inGroup: req.params.gid}, function(err) {
      if(err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      return res.status(200).end();
    });
  });
});


slotGroups.delete('/:gid/slot/:sid', auth.ensureAuthenticated, slotIdExist, function (req, res) {
  SlotGroup.update({_id: req.params.gid}, {$pull: {slots: req.params.sid} }, function(err) {
    if(err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    Slot.update({_id: req.params.sid}, {inGroup: null}, function(err) {
      if(err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      return res.status(200).end();
    });
  });
});

module.exports = slotGroups;