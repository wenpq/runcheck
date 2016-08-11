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
    console.log('$$:' + doc);
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

// the middleware to check before add or remove start
// check if a slot id and slot group id exists
function checkSlotId(req, res, next){
  Slot.find({_id : req.params.sid }, function (err, docs) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if (docs.length === 0) {
      return res.status(404).send('Slot of ' + req.params.sid + ' not found.');
    }
    next();
  });
}
// check whether SlotGroup.id is exist
function checkSlotGroupId(req, res, next){
  SlotGroup.find({_id : req.params.gid }, function (err, docs) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if (docs.length === 0) {
      return res.status(404).send('Slot group of ' + req.params.gid + ' not found.');
    }
    next();
  });
}
// check whether slot.inGroup is null
function checkInGroupNull(req, res, next){
  Slot.findOne({_id : req.params.sid}, function (err, doc) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if ( doc.inGroup) {
      return res.status(403).send('The inGroup field in group of ' + req.params.gid + ' is not null.');
    }
    next();
  });
}
// check whether slot.inGroup is not null
function checkInGroupNotNull(req, res, next){
  Slot.findOne({_id : req.params.sid}, function (err, doc) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if (doc.inGroup) {
      next();
    }else {
      return res.status(403).send('The inGroup field in group of ' + req.params.gid + ' is null.');
    }
  });
}
// check whether slot is not in slot group
function checkSlotNotInGroup(req, res, next){
  SlotGroup.find({ _id : req.params.gid, slots: {$elemMatch: {$eq: req.params.sid}}}, function (err, docs) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if (docs.length > 0) {
      return res.status(403).send('Slot ' + req.params.sid + 'is in slot group ' + req.params.gid);
    }
    next();
  });
}
// check whether slot is in slot group
function checkSlotInGroup(req, res, next){
  SlotGroup.find({ _id : req.params.gid, slots: {$elemMatch: {$eq: req.params.sid}}}, function (err, docs) {
    if (err){
      console.error(err);
      return res.status(500).send(err.message);
    }
    if (docs.length === 0) {
      return res.status(403).send('Slot ' + req.params.sid + 'is not in slot group ' + req.params.gid);
    }
    next();
  });
}
// the middleware to check before add end


slotGroups.put('/:gid/slot/:sid', auth.ensureAuthenticated, checkSlotId, checkSlotGroupId, checkInGroupNull, checkSlotNotInGroup, function (req, res) {
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


slotGroups.delete('/:gid/slot/:sid', auth.ensureAuthenticated, checkSlotId, checkSlotGroupId, checkInGroupNotNull, checkSlotInGroup, function (req, res) {
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