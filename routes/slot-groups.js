var express = require('express');
var slotGroups = express.Router();
var auth = require('../lib/auth');
var SlotGroup = require('../models/slot-group').SlotGroup;

slotGroups.get('/', auth.ensureAuthenticated, function (req, res) {
  res.render('slot-groups');
});


slotGroups.get('/json', auth.ensureAuthenticated, function (req, res) {
  SlotGroup.find(function(err, docs) {
    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
    res.status(200).json(docs);
  });
});


slotGroups.get('/:id', auth.ensureAuthenticated, function (req, res) {

});


slotGroups.get('/:id/json', auth.ensureAuthenticated, function (req, res) {

});


module.exports = slotGroups;