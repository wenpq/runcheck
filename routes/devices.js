var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');

devices.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('devices');
});


devices.get('/json', auth.ensureAuthenticated, function (req, res) {
  var devDocs = {
    "data": [
      {
        seridNo: '001',
        name: 'name1',
        type: 'type1',
        department: 'department1',
        owner: 'ObjectId',
        checklist: 'ObjectId'
      },
      {
        seridNo: '002',
        name: 'name2',
        type: 'type2',
        department: 'department2',
        owner: 'ObjectId2',
        checklist: 'ObjectId2'
      },
      {
        seridNo: '002',
        name: 'name2',
        type: 'type2',
        department: 'department2',
        owner: 'ObjectId2',
        checklist: 'ObjectId2'
      }
    ]
  };
  res.status(200).json(devDocs);
});


module.exports = devices;
