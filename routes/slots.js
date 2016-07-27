var express = require('express');
var slots = express.Router();
var auth = require('../lib/auth');

slots.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slots');
});


slots.get('/json', auth.ensureAuthenticated, function (req, res) {
  var slotDocs = [
    {
      details: 'ObjectId2',
      FRIBName: 'FRIBName1',
      owner: 'wen',
      area: 'area1',
      level: 'enum-low',
      deviceType: 'deviceType1',
      location: 'location1',
      device: 'device-bojectid',
      approvalStatus: 'true',

      ReadinessCheckedValue: 20,
      ReadinessTotalValue: 20,
      DRRCheckedValue: 4,
      DRRTotalValue: 17,
      ARRCheckedValue: 15,
      ARRTotalValue:16
    }
  ];
  res.status(200).json(slotDocs);
});


module.exports = slots;
