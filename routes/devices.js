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
 * set prepare and set spare for installToDevice
 * set prepare: status 0 --> 1 and installToDevice nul --> targetId
 * set spare: status (1|1.5|2|3) --> 0 and installToDevice targetId--> null
 */
devices.put('/:id/installToDevice/:targetId/:status', auth.ensureAuthenticated, function (req, res) {
  var condition;
  if (req.params.status == 1 ) {
    // prepare
    condition = {_id: req.params.id,
      installToDevice: null,
      status: 0
    };
  }else if(req.params.status == 0) {
    // spare
    condition = {_id: req.params.id,
      installToDevice: req.params.targetId,
      status: { $ne: 0}
    };
  }
  Device.findOneAndUpdate(condition, {installToDevice: req.params.targetId, status: 1}, { new: true }, function (err, newDevice) {
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
 * set prepare and set spare for installToSlot
 * set prepare: status 0 --> 1 and installToDevice nul --> targetId and slot.device null --> targetId
 * set spare: status (1|1.5|2|3) --> 0 and installToDevice targetId--> null slot.device targetId --> null
 */
devices.put('/:id/installToSlot/:targetId/:status', auth.ensureAuthenticated, function (req, res) {
  var condition;
  var slotCondition;
  if (req.params.status == 1 ) {
    // prepare
    condition = {_id: req.params.id,
      installToSlot: null,
      status: 0
    };
    slotCondition = {
      _id: req.params.targetId,
      device: null
    };
  }else if(req.params.status == 0) {
    // spare
    condition = {_id: req.params.id,
      installToSlot: req.params.targetId,
      status: { $ne: 0}
    };
    slotCondition = {
      _id: req.params.targetId,
      device: req.params.id
    };
  }
  Device.findOneAndUpdate(condition, {installToSlot: req.params.targetId, status: 1},  { new: true }, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (!newDevice) {
      return res.status(404).send('No device meet condition.');
    }
    Slot.updateOne(slotCondition, {device: req.params.id}, function (err, raw) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      if (raw.nModified == 0) {
        // TODO: MongoDB transaction
        return res.status(404).send('No slot meet condition.');
      }
      return res.status(200).json(newDevice);
    })
  });
});

module.exports = devices;