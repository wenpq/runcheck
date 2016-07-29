var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');

devices.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('devices');
});


devices.get('/json', auth.ensureAuthenticated, function (req, res) {
  var devDocs = [{
    serialNo: '001',
    name: 'name1',
    type: 'type1',
    department: 'department1',
    owner: 'wen',
    checkedValue: 0,
    totalValue: 20
  }, {
    serialNo: '002',
    name: 'name2',
    type: 'type2',
    department: 'department2',
    owner: 'wen',
    checkedValue: 2,
    totalValue: 20
  }, {
    serialNo: '003',
    name: 'name3',
    type: 'type3',
    department: 'department3',
    owner: 'wen',
    checkedValue: 16,
    totalValue: 20
  }];

  res.status(200).json(devDocs);
});


module.exports = devices;
