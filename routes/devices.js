var express = require('express');
var devices = express.Router();
var auth = require('../lib/auth');

var devDocs = [{
  _id: '507f1f77bcf86cd799439011',
  serialNo: '001',
  name: 'name1',
  type: 'type1',
  department: 'department1',
  owner: 'wen',
  checkedValue: 0,
  totalValue: 20
}, {
  _id: '507f1f77bcf86cd799439012',
  serialNo: '002',
  name: 'name2',
  type: 'type2',
  department: 'department2',
  owner: 'wen',
  checkedValue: 2,
  totalValue: 20
}, {
  _id: '507f1f77bcf86cd799439013',
  serialNo: '003',
  name: 'name3',
  type: 'type3',
  department: 'department3',
  owner: 'wen',
  checkedValue: 16,
  totalValue: 20
}];


devices.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('devices');
});


devices.get('/json', auth.ensureAuthenticated, function (req, res) {
  res.status(200).json(devDocs);
});


devices.get('/:id', auth.ensureAuthenticated, function (req, res) {
  var deviceId = req.params['id']
  for( var idx=0; idx<devDocs.length; idx+=1 ) {
    if( deviceId === devDocs[idx]._id ) {
      res.render('device', { device: devDocs[idx] });
      return
    }
  }
  res.status(404).render('error', {
    error:{
      status:'Device not Found'
    }
  })
})


devices.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  var deviceId = req.params['id']
  for( var idx=0; idx<devDocs.length; idx+=1 ) {
    if( deviceId === devDocs[idx]._id ) {
      res.status(200).json(devDocs[idx]);
      return
    }
  }
  res.status(404).send('device not found');
})


module.exports = devices;
