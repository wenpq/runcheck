var XLSX = require('xlsx');
var Model = require('../models/' + global.lconfig.name)[global.lconfig.model];
var Schema = Model.schema;
var mongoose = require('mongoose');

/*
 delete null or white space field, rename key ,delete non-number characters(unit) in number field
 datalist:   the originnale json list from xlsx file
 dataschema: the data model schema defined by mongoose
 nameMap:    model field and original column name mapping
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

// filter
function filtByField(x) {
  var field = global.lconfig.filterField;
  var v = true;
  for(var i = 0 ;i < field.length; i++) {
    v = v && x[field[i]];
  }
  return v;
}

/*
 convert data in xlsx to json format.
 each sheet will be handled
 */
function getXlsxJson(fileName) {
  // Read data from sheet
  var workbook = XLSX.readFile(fileName);
  var data = [];
  global.lconfig.position.forEach(function(p){
    var branch = workbook.Sheets[p.sheet];
    branch['!ref'] = p.range;
    var l = XLSX.utils.sheet_to_json(branch);
    data = data.concat(l);
  });

  fieldFixed(data, Schema, global.lconfig.nameMap);
  if(global.lconfig.filterField) {
    data = data.filter(filtByField);
  }
  return data;
}

/*
 validate field by schema
 datalist: json object list
 */
function dataValidate(datalist, callback) {
  var error;
  var dataModel = [];
  for (var i = 0; i < datalist.length; i++) {
    var sobj = new Model(datalist[i]);
    // convert string to ObjectId
    for(var attr in datalist[i]) {
      if (Model.schema.path(attr).instance === 'ObjectID') {
        sobj[attr] = mongoose.Types.ObjectId(sobj[attr]);
      }
    }
    sobj.ARR = mongoose.Types.ObjectId(sobj.ARR);
    console.log('Validate ' + sobj.name);
    error = sobj.validateSync();
    // dataModel.push(sobj);
    if (error) {
      break;
    } else {
      console.log('Success.');
      dataModel.push(sobj);
    }
  }
  callback(error, dataModel);
}


/*
 save data to file
 data: the validated json object list
 fname: the file name
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


/*
 save data to mongoDB
 data: the validated json object list
 */
function saveModel(data, callback) {
  var count = 0;
  data.forEach(function (x) {
    x.save(function (err, doc) {
      if (err) {
        console.error(err);
      } else {
        console.log(doc.name + ' saved');
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
