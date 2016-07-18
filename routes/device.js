var express = require('express');
var router = express.Router();

router.get('/devices/', function(req, res, next) {
  res.render('devices', { title: 'devices',prefix: ''});
});

module.exports = router;
