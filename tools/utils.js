var XLSX = require('xlsx');
var lconfig = require('./xlsx-mongo').lconfig;
var Model = require('../models/' + lconfig.name)[lconfig.model];
var Schema = Model.schema;
var mongoose = require('mongoose');


/**
 * delete null or white space field, rename key ,delete non-number characters(unit) in number field
 * @param datalist    the originnale json list from xlsx file
 * @param dataSchema  the data model schema defined by mongoose
 * @param nameMap     model field and original column name mapping
 */
function fieldFixed(datalist, dataSchema, nameMap) {
  datalist.forEach(function (x) {
    nameMap.forEach(function (n) {
      if (x[n[1]] !== undefined) {
        // delete '' or ' '
        if (x[n[1]].length === 0 || !x[n[1]].replace(/\s/g, '').length) {
          delete x[n[1]];
          return
        }
        // rename key
        x[n[0]] = x[n[1]];
        delete x[n[1]];
        // delete non-number characters(unit) in number field
        if (dataSchema.paths[n[0]].instance === 'Number') {
          x[n[0]] = x[n[0]].replace(/[^\+\-0-9\.]+/g, '');
        }
      }
    })
  });
}


/**
 * filter
 * @param x
 * @returns {boolean}
 */
function filtByField(x) {
  var field = lconfig.filterField;
  var v = true;
  for(var i = 0 ;i < field.length; i++) {
    v = v && x[field[i]];
  }
  return v;
}


/**
 * convert data in xlsx to json format, each sheet will be handled
 * @param fileName
 * @returns {Array}
 */
function getXlsxJson(fileName) {
  // Read data from sheet
  var workbook = XLSX.readFile(fileName);
  var data = [];
  lconfig.position.forEach(function(p){
    var branch = workbook.Sheets[p.sheet];
    if(!branch) {
      console.error('error: can not read data from sheet ' + p.sheet + ', please check the config file.');
      process.exit(1);
    }
    branch['!ref'] = p.range;
    var l = XLSX.utils.sheet_to_json(branch);
    data = data.concat(l);
  });
  if (data.length === 0) {
    console.error('error: can not convert data to valid json list, please check the config file.');
    process.exit(1);
  }

  fieldFixed(data, Schema, lconfig.nameMap);
  if(lconfig.filterField) {
    data = data.filter(filtByField);
  }
  return data;
}


/**
 * get unique fields by schema
 * @returns {Array}
 */
function getUniqueField(){
  var uniqueFields = [];
  for (var a in Schema.paths) {
    if (Schema.paths[a].options.unique) {
      uniqueFields.push(a);
    }
  }
  return uniqueFields;
}

// get identity as show name
var uniqueFields = getUniqueField();
var identity = uniqueFields.length? uniqueFields[0] : '_id';

/**
 * remove the duplicate entries and validate field by schema.
 * @param oridatalist    json object list
 * @param callback
 */
function dataValidate(oridatalist, callback) {
  var dataModel = [];
  console.log('Format validation start.');
  var ids = [];
  oridatalist.forEach(function(d) {
    ids.push(d[identity]);
  });
  // remove duplicate value
  var datalist = oridatalist.filter(function(elem, pos) {
    return ids.indexOf(elem[identity]) == pos;
  });
  var rn = oridatalist.length - datalist.length;
  console.log('There are ' + rn + ' duplicate entries removed.');

  for (var i = 0; i < datalist.length; i++) {
    var sobj = new Model(datalist[i]);
    // convert string to ObjectId
    for(var attr in datalist[i]) {
      if (Model.schema.path(attr).instance === 'ObjectID') {
        sobj[attr] = mongoose.Types.ObjectId(sobj[attr]);
      }
    }
    sobj.ARR = mongoose.Types.ObjectId(sobj.ARR);
    var err = sobj.validateSync();
    if (err) {
      console.error('Validate ' + sobj[identity] + ' format failed.');
      console.error(err);
    }else {
      dataModel.push(sobj);
      console.log('Validate ' + sobj[identity] + ' format successfully.');
    }
  }
  // check unique field
  dataUniqueValidate(dataModel, callback);
}


/**
 * validate unqique field.
 * warning: currently, only validate the first unique field
 * @param datalist
 * @param callback
 */
function dataUniqueValidate(datalist, callback) {
  var dataModel = [];
  console.log('Unique validation.');
  if(!datalist.length) {
    callback('Validation failed: all entries are not passed', dataModel);
    return;
  }
  if(!uniqueFields.length) {
    callback(null, datalist);
    return;
  }
  var ids = [];
  datalist.forEach(function(d) {
    ids.push(d[identity]);
  });

  var queryJson = {};
  queryJson[identity] = {$in: ids};
  Model.find(queryJson , function(err, docs){
    var sames = [];
    if(err) {
      console.error(err);
    }
    if(docs.length) {
      docs.forEach(function(d) {
        sames.push(d[identity]);
        console.error('Validate ' + d[identity] + ' failed: duplicate value for ' + identity);
      })
    }
    // push passed objects
    for (var i = 0; i < datalist.length; i++) {
      if(sames.indexOf(datalist[i][identity]) === -1) {
        dataModel.push(datalist[i]);
      }
    }
    if (dataModel.length !== datalist.length){
      var faledNumber = datalist.length - dataModel.length;
      var error = 'Validation failed: ' + faledNumber + ' entries are not passed, ' + 'only ' + dataModel.length + ' can be saved';
      callback(error, dataModel);
    }
    console.log('Unique validation success.');
    callback(null, dataModel);
  });
}


/**
 * save data to file
 * @param data    the validated json object list
 * @param fname   the file name
 */
function saveFile(data, fname) {
  var fs = require('fs');
  fs.writeFile(fname, JSON.stringify(data, null, 2), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('The data are saved in ' + fname);
  });
}


/**
 * save data to mongoDB
 * @param data     the validated json object list
 * @param callback
 */
function saveModel(data, callback) {
  var count = 0;
  if (!data.length) {
    callback(0);
  }
  data.forEach(function (x) {
    console.log(x[identity]);
    x.save(function (err) {
      if (err) {
        console.error(err.errmsg);
      } else {
        console.log(x[identity] + ' saved');
      }
      count = count + 1;
      if (count === data.length) {
        callback(count);
      }
    });
  })
}

module.exports = {
  getXlsxJson: getXlsxJson,
  dataValidate: dataValidate,
  saveFile: saveFile,
  saveModel: saveModel
};
