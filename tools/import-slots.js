#!/usr/bin/env node
var config = require('../config/config.js');
var mongoose = require('mongoose');
var program = require('commander');
var path = require('path');
var fs = require('fs');

// get arguments starts
var inputPath;
program.version('0.0.1')
  .option('-d, --dryrun', 'validate data by schema in MongoDB.')
  .option('-m, --mongo', 'save data in defoult MongoDB.')
  .option('-o, --outfile [outfle]', 'save data in specified file.')
  .option('-f, --force', 'force to save in MongoDB when the DB already has data.')
  .arguments('<spec>')
  .action(function (sp) {
    inputPath = sp;
  });
program.parse(process.argv);
// get arguments end

// check path starts
if (inputPath === undefined) {
  console.error('Need the input config file path!');
  process.exit(1);
}
var realPath = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(realPath)) {
  console.log(realPath);
  console.error(realPath + ' does not exist.');
  console.error('Please input a valid config file path.');
  process.exit(1);
}
// check path end


// check global.lconfig starts
global.lconfig = require(realPath);
// essential field
var essential = ['name','model','collection','file','nameMap','position'];
for(var i = 0; i < essential.length; i++) {
  if(!global.lconfig[essential[i]]) {
    console.error('error: ' + essential[i] + ' is required in config file.');
    process.exit(1);
  }
}
// suffix must be xlsx
var suffix = global.lconfig.file.split('.').pop();
if (suffix !== 'xlsx') {
  console.error('error: File format must be xlsx.');
  process.exit(1);
}
// array field
if(!Array.isArray(global.lconfig.position)) {
  console.error('error: sheet field must be array');
  process.exit(1);
}
if(!Array.isArray(global.lconfig.nameMap)) {
  console.error('error: nameMap field must be array');
  process.exit(1);
}
// check confg end


console.log('----------Import Data from xlsx file to MongoDB-------------');
var sutil = require('./utils');

var datalist = sutil.getXlsxJson(global.lconfig.file);
console.log('Get ' + datalist.length + ' entries from ' + global.lconfig.file);

sutil.dataValidate(datalist, function (err, data) {
  if (err) {
    console.error(err);
  }
  console.log('All data validation completed, Can be saved in MongoDB now.');
  if (program.dryrun) {
    console.log('Dry run end');
  }
  if (program.outfile) {
    sutil.saveFile(data, program.outfile);
  }
  if (program.mongo) {
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
    // save to mongo DB
    saveInMongo(data, function (count) {
      console.log(count + ' entries are saved(' + ' total are ' + data.length + ' )');
      mongoose.connection.close();
    });
  }
});


function saveInMongo(data, callback) {
  mongoose.connection.on('connected', function () {
    mongoose.connection.db.listCollections({
      name: global.lconfig.collection
    }).next(function (err, collinfo) {
      // if MongoDB already had data, give up saving
      if (collinfo && (typeof program.force) === 'undefined') {
        console.log('Can not save, because MongoDB already had ' + global.lconfig.name + ' data. You can force to save by adding [-f | --force] option.');
        callback();
      } else {
        // Save Data
        sutil.saveModel(data, callback);
      }
    });
  })
}
