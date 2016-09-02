var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');
var Device = require('../models/device').Device;
var Checklist = require('../models/checklist').Checklist;
var defaultDeviceChecklist = require('../models/checklist').defaultDeviceChecklist;


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
      device: device
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
              checklist: checklist
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
              checklist: checklist
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
      return res.status(404).render('error', {
        error: {
          status: err
        }
      });
    }
    res.status(200).json(device);
  });
});


module.exports = devices;