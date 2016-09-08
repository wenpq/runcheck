var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');
var Device = require('../models/device').Device;
var Slot = require('../models/slot').Slot;
var DeviceSlot = require('../models/device-slot').DeviceSlot;
var checklistValues = require('../models/checklist').checklistValues;
var checklistSubjects = require('../models/checklist').deviceChecklistSubjects;
var log = require('../lib/log');
var reqUtils = require('../lib/req-utils');
var debug = require('debug')('runcheck:devices');
var _ = require('lodash');

var moment = require('moment');

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


devices.get('/:id', auth.ensureAuthenticated, reqUtils.exist('id', Device), function (req, res) {
  var device = req[req.params.id];
  debug(device.installToDevice);
  debug(device.installToSlot);
  device.populate('__updates', function (pErr, newDevice) {
    if (pErr) {
      log.error(pErr);
      return res.status(500).send(pErr.message);
    }
    return res.render('device', {
      device: newDevice,
      moment: moment,
      _: _,
      checklistValues: checklistValues,
      checklistSubjects: checklistSubjects
    });
  });
});


devices.post('/:id', auth.ensureAuthenticated, function (req, res) {
  Device.findById(req.params['id'], function (err, device) {
    var idx, item, subject, status = 404;
    var nRequired = 0,
      nChecked = 0;
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
        device.checklist = {
          required: true
        };
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
          if ((item.value === 'Y') || (item.value === 'YC')) {
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


devices.put('/:id/install-to-device', auth.ensureAuthenticated, reqUtils.exist('id', Device), reqUtils.hasAll('body', ['targetId']), reqUtils.exist('targetId', Device, '_id', 'body'), function (req, res) {
  var device = req[req.params['id']];
  var target = req[req.body['targetId']];
  if (device.installToDevice.id || device.installToSlot.id) {
    return res.status(400).send('The device already had a install-to target.');
  }

  if (req.params.id === req.body.targetId) {
    return res.status(400).send('Cannot install a device to itself.');
  }

  // update
  device.set({
    installToDevice: {
      id: target._id,
      serialNo: target.serialNo
    },
    status: 1
  });
  device.saveWithHistory(req.session.userid, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    newDevice.populate('__updates', function (pErr, d) {
      if (pErr) {
        log.error(pErr);
        return res.status(500).send(pErr.message);
      }
      return res.json(d);
    })
  });
});

devices.delete('/:id/install-to-device/:toid', auth.ensureAuthenticated, reqUtils.exist('id', Device), function (req, res) {
  var device = req[req.params['id']];
  if (_.get(device, 'installToDevice.id') !== req.params.toid) {
    return res.status(400).send('The current install-to-device is not ' + req.params.toid);
  }

  // update
  device.installToDevice.id = null;
  device.installToDevice.serialNo = null;
  device.status = 0;
  device.saveWithHistory(req.session.userid, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    newDevice.populate('__updates', function (pErr, d) {
      if (pErr) {
        log.error(pErr);
        return res.status(500).send(pErr.message);
      }
      return res.json(d);
    })
  });
});

var deviceTransition = [
  '0-1',
  '1-1.5',
  '1-2',
  '1-0',
  '1.5-2',
  '1.5-0',
  '2-3',
  '2-0',
  '3-0'
];

devices.put('/:id/install-to-device/:toid/status', auth.ensureAuthenticated, reqUtils.exist('id', Device), reqUtils.hasAll('body', ['status']), function (req, res) {
  var device = req[req.params['id']];
  if (device.installToDevice.id !== req.params.toid) {
    return res.status(400).send('The current install-to-device is not ' + req.params.toid);
  }

  if (!_.isNumber(req.body.status)) {
    return res.status(400).send('Need a number for the status.');
  }
  // validate transition
  if (device.status === req.body.status) {
    return res.status(200).send('Status not changed.');
  }
  if (deviceTransition.indexOf(device.status + '-' + req.body.status) === -1) {
    return res.status(400).send('The status change is not allowed.');
  }
  // update
  device.status = req.body.status;
  if (device.status === 0) {
    device.installToDevice.id = null;
    device.installToDevice.serialNo = null;
  }

  device.saveWithHistory(req.session.userid, function (err, newDevice) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    newDevice.populate('__updates', function (pErr, d) {
      if (pErr) {
        log.error(pErr);
        return res.status(500).send(pErr.message);
      }
      return res.json(d);
    })
  });
});

devices.put('/:id/install-to-slot', auth.ensureAuthenticated, reqUtils.exist('id', Device), reqUtils.hasAll('body', ['targetId']), reqUtils.exist('targetId', Slot, '_id', 'body'), function (req, res) {
  var device = req[req.params['id']];
  var slot = req[req.body['targetId']];
  if (device.installToDevice.id || device.installToSlot.id) {
    return res.status(400).send('The device already has a install-to-slot target.');
  }
  var deviceSlot = new DeviceSlot({
    deviceId: device._id,
    slotId: slot._id
  });
  deviceSlot.save(function (err) {
    if (err) {
      log.error(err);
      if (err.code === 11000) {
        return res.status(400).send('The device already has a install-to-slot target.');
      }
      return res.status(500).send(err.message);
    }
    // update slot
    slot.set({
      device: {
        id: device._id,
        serialNo: device.serialNo
      }
    });
    slot.saveWithHistory(req.session.userid, function (err) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      // update device
      device.set({
        installToSlot: {
          id: slot._id,
          name: slot.name
        },
        status: 1
      });
      device.saveWithHistory(req.session.userid, function (dErr, newDevice) {
        if (dErr) {
          log.error(err);
          return res.status(500).send(dErr.message);
        }
        newDevice.populate('__updates', function (pErr, d) {
          if (pErr) {
            log.error(pErr);
            return res.status(500).send(pErr.message);
          }
          return res.json(d);
        })
      });
    });
  });
});


devices.delete('/:id/install-to-slot/:toid', auth.ensureAuthenticated, reqUtils.exist('id', Device),  reqUtils.exist('toid', Slot), deleteInstallToSlot);

function deleteInstallToSlot(req, res) {
  var device = req[req.params['id']];
  var slot = req[req.params['toid']];
  DeviceSlot.remove({
    deviceId: req.params.id,
    slotId: req.params.toid
  }, function (err, raw) {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (raw.result.n === 0) {
      return res.status(404).send('The current install-to-slot is not ' + req.params.toid);
    }
    // slot
    slot.device.id = null;
    slot.device.serialNo = null;
    slot.status = null;
    slot.saveWithHistory(req.session.userid, function (sErr) {
      if (sErr) {
        log.error(sErr);
        return res.status(500).send(sErr.message);
      }
      // update device
      device.installToSlot.id = null;
      device.installToSlot.name = null;
      device.status = 0;
      device.saveWithHistory(req.session.userid, function (dErr, newDevice) {
        if (dErr) {
          log.error(dErr);
          return res.status(500).send(dErr.message);
        }
        newDevice.populate('__updates', function (pErr, d) {
          if (pErr) {
            log.error(pErr);
            return res.status(500).send(pErr.message);
          }
          return res.json(d);
        })
      });
    });
  });
}

devices.put('/:id/install-to-slot/:toid/status', auth.ensureAuthenticated, reqUtils.exist('id', Device), reqUtils.exist('toid', Slot), reqUtils.hasAll('body', ['status']), function (req, res) {
  var device = req[req.params['id']];
  if (device.installToSlot.id !== req.params.toid) {
    return res.status(400).send('The current install-to-slot is not ' + req.params.toid);
  }
  if (!_.isNumber(req.body.status)) {
    return res.status(400).send('Need a number for the status.');
  }
  // validate transition
  if (device.status === req.body.status) {
    return res.status(200).send('Status not changed.');
  }
  if (deviceTransition.indexOf(device.status + '-' + req.body.status) === -1) {
    return res.status(400).send('The status change is not allowed.');
  }
  // update
  device.status = req.body.status;
  if (device.status === 0) {
    deleteInstallToSlot(req, res);
  }else {
    device.saveWithHistory(req.session.userid, function (err, newDevice) {
      if (err) {
        log.error(err);
        return res.status(500).send(err.message);
      }
      newDevice.populate('__updates', function (pErr, d) {
        if (pErr) {
          log.error(pErr);
          return res.status(500).send(pErr.message);
        }
        if(device.status !== 3){
          return res.json(d);
        }
        // update slot
        var slot = req[req.params.toid];
        slot.status = 1;
        slot.saveWithHistory(req.session.userid, function (sErr) {
          if (sErr) {
            log.error(sErr);
            return res.status(500).send(sErr.message);
          }
          return res.json(d);
        })
      })
    });
  }
});

module.exports = devices;
