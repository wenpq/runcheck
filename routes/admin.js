var express = require('express');
var router = express.Router();

router.get('/admin/', function(req, res, next) {
  res.render('admin', { title: 'admin',prefix: ''});
});

module.exports = router;
