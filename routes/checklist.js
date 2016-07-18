var express = require('express');
var router = express.Router();

router.get('/checklists/', function(req, res, next) {
  res.render('checklists', { title: 'checklists',prefix: ''});
});

module.exports = router;
