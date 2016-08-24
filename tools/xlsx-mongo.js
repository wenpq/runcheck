#!/usr/bin/env node
var config = require('../config/config.js');
var mongoose = require('mongoose');
var program = require('commander');
var path = require('path');
var fs = require('fs');

// get arguments starts
var dataPath;
var configPath;
program.version('0.0.1')
  .option('-d, --dryrun', 'validate data by schema in MongoDB.')
  .option('-m, --mongo', 'save data in defoult MongoDB.')
  .option('-f, --force', 'force to save the data that passed validation, whether dry-run is successful or not.')
  .option('-o, --outfile [outfle]', 'save data in specified file.')
  .arguments('<dataPath>')
  .arguments('<configPath>')
  .action(function (dp, cp) {
    dataPath = dp;
    configPath = cp;
  });
program.parse(process.argv);
if(!program.dryrun) {
  program.dryrun = true;
}
// get arguments end


// check dataPath starts
if (dataPath === undefined) {
  console.error('Need the input .xlsx data file path!');
  process.exit(1);
}
var realDataPath = path.resolve(process.cwd(), dataPath);
if (!fs.existsSync(realDataPath)) {
  console.error(realDataPath + ' does not exist.');
  console.error('error: invalid .xlsx data file path.');
  process.exit(1);
}
// suffix must be xlsx
var suffix = realDataPath.split('.').pop();
if (suffix !== 'xlsx') {
  console.error('error: File format must be xlsx.');
  process.exit(1);
}
// check dataPath end


// check configPath starts
if (configPath === undefined) {
  console.error('Need the input config file path!');
  process.exit(1);
}
var realConfigPath = path.resolve(process.cwd(), configPath);
if (!fs.existsSync(realConfigPath)) {
  console.error(realConfigPath + ' does not exist.');
  console.error('error: invalid config file path.');
  process.exit(1);
}
// check configPath end


// check config content starts
var lconfig = require(realConfigPath);
module.exports = {
  lconfig: lconfig
};
// essential field
var essential = ['name','model','collection','nameMap','position'];
for(var i = 0; i < essential.length; i++) {
  if(!lconfig[essential[i]]) {
    console.error('error: ' + essential[i] + ' is required in config file.');
    process.exit(1);
  }
}
// array field
if(!Array.isArray(lconfig.position)) {
  console.error('error: sheet field must be array');
  process.exit(1);
}
if(!Array.isArray(lconfig.nameMap)) {
  console.error('error: nameMap field must be array');
  process.exit(1);
}
// check config content end


// connect mongo starts
var mongoURL = 'mongodb://' + (config.mongo.address || 'localhost') + ':' + (config.mongo.port || '27017') + '/' + (config.mongo.db || 'runcheck');
var mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: {
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};
if (config.mongo.user && config.mongo.pass) {
  mongoOptions.user = config.mongo.user;
  mongoOptions.pass = config.mongo.pass;
}

if (config.mongo.auth) {
  mongoOptions.auth = config.mongo.auth;
}
mongoose.connect(mongoURL, mongoOptions);
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection opened.');
});
mongoose.connection.on('error', function (err) {
  console.error('Mongoose default connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
  process.exit(0);
});
// connect mongo end

console.log('----------Import Data from xlsx file to MongoDB-------------');
var sutil = require('./utils');

var datalist = sutil.getXlsxJson(realDataPath);
console.log('Get ' + datalist.length + ' entries from ' + realDataPath);

sutil.dataValidate(datalist, function (err, data) {
  if (err) {
    console.error(err);
  }else {
    console.log('All data validation completed successfully.');
  }
  console.log('Dryrun end.');
  if (program.outfile) {
    sutil.saveFile(data, program.outfile);
  }
  if (program.mongo || program.force) {
    // save to mongo DB
    if (err && !program.force) {
      console.log('Can not save, because some entries are failed in dryrun. You can force to save the data that passed validation by using [-f] option.');
      mongoose.connection.close();
    } else {
      // Save Data
      console.log('Start importing Data to MongoDB');
      sutil.saveModel(data, function (count) {
        console.log(count + ' entries are saved(' + ' total are ' + data.length + ' )');
        mongoose.connection.close();
      });
    }
  }else {
    mongoose.connection.close();
  }
});
