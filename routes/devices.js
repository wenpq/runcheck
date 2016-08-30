var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');
var Device = require('../models/device').Device;
var Slot = require('../models/slot').Slot;
var checklistValues = require('../models/checklist').checklistValues;
var checklistSubjects = require('../models/checklist').deviceChecklistSubjects;
var log = require('../lib/log');

devices.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('devices');
});


devices.get('/json', auth.ensureAuthenticated, function (req, res) {
  Device.find(function (err, devices) {
    if (err) {
      return res.status(500).json({
        error: {
          status: err
        }
      });
    }
    return res.status(200).json(devices);
  });
});


devices.get('/:id', auth.ensureAuthenticated, function (req, res) {
  Device.findById(req.params['id'], function (err, device) {
    if (err) {
      return res.status(404).render('error', {
        error: {
          status: err
        }
      });
    }
    return res.render('device', {
      device: device,
      checklistValues: checklistValues,
      checklistSubjects: checklistSubjects
    });
  });
});


devices.post('/:id', auth.ensureAuthenticated, function (req, res) {
  Device.findById(req.params['id'], function (err, device) {
    var idx, item, subject, status = 404;
    var nRequired = 0, nChecked = 0;
    if (err) {
      return res.status(status).render('error', {
        error: {
          status: err
        }
      });
    }
    if (req.body['action'] === 'require-checklist') {
      if (device.checklist) {
        status = 200;
        // checklist already created
        device.checklist.required = true;
      } else {
        status = 201;
        // create checklist based on its schema
        device.checklist = { required: true };
      }
    }
    if (req.body['action'] === 'config-checklist') {
      for (idx in checklistSubjects) {
        subject = checklistSubjects[idx];
        item = device.checklist[subject];
        if (item.required !== undefined) {
          if (req.body[subject] && req.body[subject] === 'true') {
            item.required = true;
          } else {
            item.required = false;
          }
        }
        // need to update the total required and checked
        if (item.required != false) {
          nRequired += 1;
          if ((item.value === 'Y') || (item.value === 'YC') ) {
            nChecked += 1;
          }
        }
      }
      device.totalValue = nRequired;
      device.checkedValue = nChecked;
      status = 200;
    }
    if (req.body['action'] === 'update-checklist') {
      for (idx in checklistSubjects) {
        subject = checklistSubjects[idx];
        item = device.checklist[subject];
        if (req.body[subject]) {
          item.value = req.body[subject];
        }
        // need to update the total required and checked
        if (item.required !== false) {
          nRequired += 1;
          if ((item.value === 'Y') || (item.value === 'YC')) {
            nChecked += 1;
          }
        }
      }
      device.totalValue = nRequired;
      device.checkedValue = nChecked;
      status = 200;
    }
    // TODO: save the device to the db
    res.status(status).render('device', {
      device: device,
      checklistValues: checklistValues,
      checklistSubjects: checklistSubjects
    });
  });
});


devices.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  Device.findById(req.params['id'], function (err, device) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).json(device);
  });
});

devices.get('/json/serialNos', auth.ensureAuthenticated, function (req, res) {
  Device.find({}, {serialNo: true}, function (err, docs) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    return res.status(200).json(docs);
  });
});


/**
 * update status and installToDevice for device
 * set prepare: status 0 --> 1 and installToDevice nul --> id
 * set spare: status (1|1.5|2|3) --> 0 and installToDevice id--> null
 */
devices.put('/:id/installToDevice/:oldId/:newId/status/:oldStatus/:newStatus', auth.ensureAuthenticated, checkStatusTransition, function (req, res) {
  var condition = {_id: req.params.id,
    installToDevice: req.params.oldId,
    status: req.params.oldStatus
  };
  var updateInfo =  { installToDevice: req.params.newId,
    status: req.params.newStatus
  };
  Device.findOneAndUpdate(condition, updateInfo, { new: true }, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (!newDevice) {
      return res.status(404).send('No device meet condition.');
    }
    return res.status(200).json(newDevice);
  });
});


/**
 * update status and installToSlot for device
 * set prepare: status 0 --> 1 and installToDevice nul --> targetId and slot.device null --> targetId
 * set spare: status (1|1.5|2|3) --> 0 and installToDevice targetId--> null slot.device targetId --> null
 * TODO: MongoDB transaction?
 */
devices.put('/:id/installToSlot/:oldId/:newId/status/:oldStatus/:newStatus', auth.ensureAuthenticated, checkStatusTransition, function (req, res) {
  var condition = {_id: req.params.id,
    installToSlot: req.params.oldId,
    status: req.params.oldStatus
  };
  var updateInfo =  { installToSlot: req.params.newId,
    status: req.params.newStatus
  };
  Device.findOneAndUpdate(condition, updateInfo, { new: true }, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (!newDevice) {
      return res.status(404).send('No device meet condition.');
    }
    if (req.params.oldId === req.params.newId) {
      return res.status(200).json(newDevice);
    }
    // update slot
    var slotCondition;
    var slotUpdateInfo;
    if (req.params.oldStatus === '0') { // to install
      slotCondition = {_id: req.params.newId,
        device: null
      };
      slotUpdateInfo = {device: req.params.id}
    }else if (req.params.newStatus === '0'){ // to spare
      slotCondition = {_id: req.params.oldId,
        device: {$ne: null}
      };
      slotUpdateInfo = {device: null};
    }
    Slot.update(slotCondition, slotUpdateInfo, function (err, raw) {
      if (err) {
        log.error(err);
        log.error('Slot ' + slotCondition._id + 'is inconsistent with device ' + newDevice._id);
        return res.status(500).send(err.message);
      }
      if (raw.nModified == 0) {
        log.error('Slot ' + slotCondition._id + 'is inconsistent with device ' + newDevice._id);
        return res.status(404).send('Slot not modified, no slot meet condition.');
      }
      return res.status(200).json(newDevice);
    })
  });
});


/**
 * check parameters for device status transition
 * @param req
 * @param res
 * @param next
 * @returns {*}   400 error message
 */
function checkStatusTransition(req, res, next) {
  var transition = [
    '0-1',
    '1-1.5',
    '1-2',
    '1.5-2',
    '2-3',
    '1-0',
    '1.5-0',
    '2-0',
    '3-0'
  ];
  // 'null' -> null
  if(req.params.oldId === 'null') req.params.oldId = null;
  if(req.params.newId === 'null') req.params.newId = null;

  if(!req.params.newId && !req.params.oldId) {
    return res.status(400).send('Forbidden to set installToSlot or installToDevice value from null to null.');
  }
  if(req.params.newId && req.params.oldId && req.params.newId !== req.params.oldId) {
    return res.status(400).send('Forbidden to set installToSlot or installToDevice value from ' + req.params.oldId + ' to ' + req.params.newId);
  }
  var tran = req.params.oldStatus + '-' + req.params.newStatus;
  if(transition.indexOf(tran) === -1) {
    return res.status(400).send('Forbidden to set status value from ' + req.params.oldStatus + ' to ' + req.params.newStatus);
  }
  next();
}

module.exports = devices;