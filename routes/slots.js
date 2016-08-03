var express = require('express');
var slots = express.Router();
var auth = require('../lib/auth');

slots.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slots');
});

slots.get('/json', auth.ensureAuthenticated, function (req, res) {
  var slotDocs = [
    {
      details: 'details link',
      name: 'FRIBName1',
      owner: 'wen',
      area: 'area1',
      level: 'enumeration',
      deviceType: 'deviceType1',
      location: 'location1',
      device: 'objectid',
      approvalStatus: 'true',
      machineMode: 'definition unclear',
      ReadinessCheckedValue: 10,
      ReadinessTotalValue: 10,
      DRRCheckedValue: 4,
      DRRTotalValue: 10,
      ARRCheckedValue: 0,
      ARRTotalValue:10
    }
  ];
  res.status(200).json(slotDocs);
});

slots.post('/AddGroupValidate',auth.ensureAuthenticated, function (req, res) {
  var passData = req.body.slots;
  var rejectData = req.body.slots;
  console.log(req.body.slots);
  res.status(200).json({
    passData: passData,
    rejectData: rejectData
  });
});


module.exports = slots;
