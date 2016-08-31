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


devices.put('/:id/installToDevice/:targetId', auth.ensureAuthenticated, function (req, res) {
  Device.findOne({_id: req.params.id}, function (err, device) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    // check status
    if (req.params.targetId === 'null') { // to spare
      if (!device.installToDevice || device.status === 0) {
        return res.status(409).send('Device has been uninstalled or status is spare.');
      }
    } else { // to install
      if (device.installToDevice || device.status !== 0) {
        return res.status(409).send('Device has been installed or status not spare.');
      }
    }
    // update
    if(req.params.targetId === 'null') {
      device.installToDevice = null;
      device.status = 0;
    }else {
      device.installToDevice = req.params.targetId;
      device.status = 1;
    }
    device.save(function(err, newDevice) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      return res.status(200).send(newDevice)
    })
  })
});


devices.put('/:id/installToSlot/:targetId', auth.ensureAuthenticated, function (req, res) {
  Device.findOne({_id: req.params.id}, function (err, device) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    // check status
    if(req.params.targetId === 'null' ) { // to spare
      if(!device.installToSlot || device.status === 0) {
        return res.status(409).send('Device has been uninstalled or status is spare.');
      }
    }else { // to install
      if(device.installToSlot || device.status !== 0) {
        return res.status(409).send('Device has been installed or status not spare.');
      }
    }
    var preInstallToSlot = device.installToSlot;
    // update
    if(req.params.targetId === 'null') {
      device.installToSlot = null;
      device.status = 0;
    }else {
      device.installToSlot = req.params.targetId;
      device.status = 1;
    }
    device.save(function(err, newDevice) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      // update slot
      var slotCondition;
      var slotUpdateInfo;
      if (req.params.targetId === 'null') {
        slotCondition = {
          _id: preInstallToSlot,
          device: {$ne: null}
        };
        slotUpdateInfo = {device: null};
      }else{
        slotCondition = {
          _id: req.params.targetId,
          device: null
        };
        slotUpdateInfo = {device: req.params.id}
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
});


devices.put('/:id/status/:status', auth.ensureAuthenticated, checkStatusTransition, function (req, res) {
  req.params.device.status = req.params.status;
  req.params.device.save(function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    return res.status(200).json(newDevice);
  });
});


/**
 * check device status transition
 * @param req
 * @param res
 * @param next
 * @returns {*}   400 404 500 error message
 */
function checkStatusTransition(req, res, next) {
  var transition = [
    '1-1.5',
    '1-2',
    '1.5-2',
    '2-3'
  ];
  Device.findOne({_id: req.params.id},function(err, device){
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (!device) {
      return res.status(404).send('No device id is ' + req.params.id);
    }
    var tran = device.status + '-' + req.params.status;
    if(transition.indexOf(tran) === -1) {
      return res.status(400).send('Forbidden to set status value from ' + req.params.oldStatus + ' to ' + req.params.newStatus);
    }
    req.params.device = device;
    next();
  });
}

module.exports = devices;