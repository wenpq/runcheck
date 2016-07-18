var express = require('express');
var router = express.Router();

router.get('/slots/', function(req, res, next) {
  res.render('slots', { title: 'slots',prefix: ''});
});

module.exports = router;
