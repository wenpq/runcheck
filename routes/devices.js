var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');
var Device = require('../models/device').Device;
var Slot = require('../models/slot').Slot;
var DeviceSlot = require('../models/device-slot').DeviceSlot;
var Checklist = require('../models/checklist').Checklist;
var defaultDeviceChecklist = require('../models/checklist').defaultDeviceChecklist;
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
      _: _
    });
  });
});


devices.post('/:id', auth.ensureAuthenticated, function (req, res) {
  Device.findById(req.params['id'], function (err, device) {
    if (err) {
      return res.status(404).render('error', {
        error: {
          status: err
        }
      });
    }
    if (req.body['action'] === 'checklist-required') {
      if (device.irrChecklist && device.irrChecklist.id) {
        // checklist already created
        Checklist.findById(device.irrChecklist.id, function (err, checklist) {
          if (err) {
            return res.status(500).render('error', {
              error: {
                status: err
              }
            });
          }
          device.irrChecklist.required = true;
          device.save(function (err) {
            if (err) {
              return res.status(500).render('error', {
                error: {
                  status: err
                }
              });
            }
            return res.status(200).render('device', {
              device: device,
              moment: moment,
              _: _
            });
          });
        });
      } else {
        // checklist must be created
        var checklist = new Checklist(defaultDeviceChecklist);
        checklist.save(function (err) {
          if (err) {
            return res.status(500).render('error', {
              error: {
                status: err
              }
            });
          }
          device.irrChecklist.id = checklist._id;
          device.irrChecklist.required = true;
          device.save(function (err) {
            if (err) {
              return res.status(500).render('error', {
                error: {
                  status: err
                }
              });
            }
            return res.status(201).render('device', {
              device: device,
              moment: moment,
              _: _
            });
          });
        });
      }
    }
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

devices.put('/:id/install-to-slot', auth.ensureAuthenticated, reqUtils.exist('id', Device), checkDeviceSlot, function (req, res) {

  var status = req.body.targetId ? 1 : 0;
  Device.findOne({
    _id: req.params.id
  }, function (err, device) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (!device) {
      var errMsg = 'Device of _id ' + req.params.id + 'not found';
      log.error(errMsg);
      return res.status(404).send(errMsg);
    }
    var slotId = req.body.targetId ? req.body.targetId : device.installToSlot;
    var slotDeviceId = req.body.targetId ? req.params.id : null;
    // update device
    device.installToSlot = req.body.targetId;
    device.status = status;
    device.save(function (err) {
      if (err) {
        log.error(err);
      }
      Slot.update({
        _id: slotId
      }, {
        device: slotDeviceId
      }, function (err, raw) {
        if (err) {
          log.error(err);
          return res.status(500).send(err.message);
        }
        if (raw.nModified === 0) {
          var errMsg = 'Slot of _id ' + slotId + ' not modified';
          log.error(errMsg);
          return res.status(404).send(errMsg);
        }
        return res.status(200).json(device);
      });
    });
  });
});

/**
 * check device and slot 1 to 1 mapping, ensure consistency.
 * @param req
 * @param res
 * @param next
 */
function checkDeviceSlot(req, res, next) {
  if (req.body.targetId) { // to install
    var deviceSlot = new DeviceSlot({
      deviceId: req.params.id,
      slotId: req.body.targetId
    });
    deviceSlot.save(function (err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      next();
    });
  } else { // to spare
    DeviceSlot.remove({
      deviceId: req.params.id
    }, function (err, raw) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (raw.result.n === 0) {
        return res.status(404).send('Device ' + req.params.id + ' installed to specifed slot not found.');
      }
      next();
    });
  }
}

module.exports = devices;