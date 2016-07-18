var express = require('express');
var router = express.Router();

router.get('/slot-groups/', function(req, res, next) {
  res.render('slot-groups', { title: 'slot-groups',prefix: ''});
});

module.exports = router;
