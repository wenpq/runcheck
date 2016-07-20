var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'runcheck'
});

module.exports = log;
