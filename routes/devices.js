var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');
var Device = require('../models/device').Device;
var checklistValues = require('../models/device').checklistValues;
var checklistSubjects = require('../models/device').checklistSubjects;

var devDocs = [new Device({
  serialNo: '001',
  name: 'name1',
  type: 'type1',
  department: 'department1',
  owner: 'wen'
}), new Device({
  serialNo: '002',
  name: 'name2',
  type: 'type2',
  department: 'department2',
  owner: 'wen'
}), new Device({
  serialNo: '003',
  name: 'name3',
  type: 'type3',
  department: 'department3',
  owner: 'wen'
})];


devices.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('devices');
});


devices.get('/json', auth.ensureAuthenticated, function (req, res) {
  res.status(200).json(devDocs);
});


devices.get('/:id', auth.ensureAuthenticated, function (req, res) {
  var deviceId = req.params['id']
  for( var idx=0; idx<devDocs.length; idx+=1 ) {
    if( devDocs[idx]._id.equals(deviceId) ) {
      res.render('device', { 
        device: devDocs[idx],
        checklistValues: checklistValues,
        checklistSubjects: checklistSubjects
      });
      return
    }
  }
  res.status(404).render('error', {
    error:{
      status:'Device not Found'
    }
  });
});


devices.post('/:id', auth.ensureAuthenticated, function (req, res) {
  var idx = 0, device = null;
  var nRequired = 0, nChecked = 0;
  var deviceId = req.params['id'];
  for( idx=0; idx<devDocs.length; idx+=1 ) {
    if( devDocs[idx]._id.equals(deviceId) ) {
      device = devDocs[idx];
    }
  }
  if( !device ) {
    res.status(404).render('error', {
      error:{
        status:'Device not Found'
      }
    });
  }

  if( req.body['action'] === 'configChecklist' ) {
    if( !device.checklist.length ) {
      for( idx=0; idx<checklistSubjects.length; idx+=1 ) {
        device.checklist.push({
          subject: checklistSubjects[idx],
          required: false,
        });
      }
    }

    for( idx=0; idx<device.checklist.length; idx+=1 ) {
      if( req.body.hasOwnProperty(device.checklist[idx].subject) 
          && req.body[device.checklist[idx].subject] === 'true' ) {
        device.checklist[idx].required = true;
      } else {
        device.checklist[idx].required = false;
      }
      // need to update the total required and checked
      if( device.checklist[idx].required ) {
        nRequired += 1;
        if( (device.checklist[idx].value === 'Y')
            || (device.checklist[idx].value === 'YC') ) {
          nChecked += 1;
        }
      }
    }

    device.totalValue = nRequired;
    device.checkedValue = nChecked;
  }
  
  if( req.body['action'] === 'updateChecklist' ) {
    for( idx=0; idx<device.checklist.length; idx+=1 ) {
      if( req.body.hasOwnProperty(device.checklist[idx].subject) ) {
        device.checklist[idx].value = req.body[device.checklist[idx].subject];
      }
      // need to update the total required and checked
      if( device.checklist[idx].required ) {
        nRequired += 1;
        if( (device.checklist[idx].value === 'Y')
            || (device.checklist[idx].value === 'YC') ) {
          nChecked += 1;
        }
      }
    }

    device.totalValue = nRequired;
    device.checkedValue = nChecked;
  }

  res.status(200).render('device', {
    device: device,
    checklistValues: checklistValues,
    checklistSubjects: checklistSubjects
  });
});


devices.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  var deviceId = req.params['id']
  for( var idx=0; idx<devDocs.length; idx+=1 ) {
    if( deviceId === devDocs[idx]._id ) {
      res.status(200).json(devDocs[idx]);
      return
    }
  }
  res.status(404).send('device not found');
});


module.exports = devices;
