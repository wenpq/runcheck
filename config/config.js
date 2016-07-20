/**
 * @fileOverview load the configuration json files
 */

var fs = require('fs');
var path = require('path');

var ad = require('./ad.json');
var app = require('./app.json');
var auth = require('./auth.json');
var mongo = require('./mongo.json');
var redis = require('./redis.json');


app.log_dir = path.resolve(__dirname, app.log_dir || '../logs/');


module.exports = {
  ad: ad,
  app: app,
  auth: auth,
  mongo: mongo,
  redis: redis
};
