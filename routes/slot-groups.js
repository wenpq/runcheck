var express = require('express');
var slotGroups = express.Router();
var auth = require('../lib/auth');

var slotGroupDocs = [{
  _id: '507f1f77bcf86cd799439011',
  name: 'name1',
  area: 'area',
  discription: 'this is a breif deccripton on slot group'
}];


slotGroups.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slot-groups');
});


slotGroups.get('/json', auth.ensureAuthenticated, function (req, res) {
  res.status(200).json(slotGroupDocs);
});


slotGroups.get('/:id', auth.ensureAuthenticated, function (req, res) {
  var slotGroupId = req.params['id'];
  for( var idx=0; idx<slotGroupDocs.length; idx+=1 ) {
    if( slotGroupId === slotGroupDocs[idx]._id ) {
      res.render('slot-group', { slotGroup: slotGroupDocs[idx] });
      return
    }
  }
  res.status(404).render('error', {
    error:{
      status:'slot group not Found'
    }
  })
});


slotGroups.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  var slotGroupId = req.params['id'];
  for( var idx=0; idx<slotGroupDocs.length; idx+=1 ) {
    if( slotGroupId === slotGroupDocs[idx]._id ) {
      res.status(200).json(slotGroupDocs[idx]);
      return
    }
  }
  res.status(404).send('slot group not found');
});


module.exports = slotGroups;