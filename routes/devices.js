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
      return res.status(404).render('error', {
        error: {
          status: err
        }
      });
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


devices.put('/:id/installToDevice/:targetId', auth.ensureAuthenticated, function (req, res) {
  // check conflict
  Device.findOne({_id: req.params.id}, function(err, device){
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (device.installToDevice) {
      return res.status(409).send('Conflict: installToDevice attribute is not empty, the value is ' + device.installToDevice);
    }
    if (device.status !== 0) {
      return res.status(409).send('Conflict: status is not spare, the value is ' + device.status);
    }
    // update
    Device.update({_id: req.params.id}, {installToDevice: req.params.targetId, status: 1},  function (err) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      return res.status(200).end();
    });
  });
});


devices.put('/:id/installToSlot/:targetId', auth.ensureAuthenticated, function (req, res) {
  // check conflict for slot
  Slot.findOne({_id: req.params.targetId}, function(err, slot) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (slot.device) {
      return res.status(409).send('Conflict: device attribute of target slot is not empty, the value is ' +  slot.device);
    }
  });
  // check conflict for device
  Device.findOne({_id: req.params.id}, function(err, device){
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (device.installToSlot) {
      return res.status(409).send('Conflict: installToSlot attribute is not empty, the value is ' + device.installToSlot);
    }
    if (device.status !== 0) {
      return res.status(409).send('Conflict: status is not spare, the value is ' + device.status);
    }
    // update
    Device.update({_id: req.params.id}, {installToSlot: req.params.targetId, status: 1},  function (err) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      // change slot status
      Slot.update({_id: req.params.targetId}, {device: req.params.id}, function (err) {
        if (err) {
          log.error(err);
          return res.status(500).send(err.message);
        }
        return res.status(200).end();
      })
    });
  });
});

module.exports = devices;