var XLSX = require('xlsx');
var Slot = require('../models/slot').Slot;
var slotSchema = require('../models/slot').slotSchema;
var mongoose = require('mongoose');

var slotNameMap =   [ ['system', 'System'],
  ['subsystem', 'Sub-\r\nsystem'],
  ['deviceNaming', 'Device'],
  ['beamlinePosition', 'Beam line position (dm)'],
  ['name', 'Name'],
  ['deviceType', 'Device Type'],
  ['elementName', 'Element Name'],
  ['level', 'Level of Care'],
  ['DRR', 'Associated DHR'],
  ['ARR', 'Associated ARR'],
  ['InnerDiameter', 'Minimum Beam Pipe Inner Diameter (mm)'],
  ['flangeLength', 'Element Flange to Flange Length (m)'],
  ['placeHolder', 'PLACE HOLDER '],
  ['effectiveLength', 'Element Effective Length (m)'],
  ['coordinateZ', 'Global Coordinate Z (m)'],
  ['coordinateY', 'Global Coordinate Y (m)'],
  ['coordinateX', 'Global Coordinate X (m)'],
  ['center2centerLength', 'Accumulated center-to-center Length (m)'],
  ['end2endLength', 'Accumulated end-to-end Length (m)'],
  ['comment', 'Comment']
];

/*
 delete null or white space field, rename key ,delete non-number characters(unit) in number field
 datalist:   the originnale json list from xlsx file
 dataschema: the data model schema defined by mongoose
 nameMap:    model field and original column name mapping
 */
function fieldFixed(datalist,dataSchema,nameMap) {
  datalist.forEach(function(x) {
    nameMap.forEach(function(n) {
      if (x[n[1]] !== undefined) {
        // delete '' or ' '
        if ( x[n[1]].length === 0 || !x[n[1]].replace(/\s/g, '').length) {
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

/*
 convert data in xlsx to json format
 */
function getSlotJson(fileName) {
  // Read slot data from file
  var workbook = XLSX.readFile(fileName);
  var branch1 = workbook.Sheets['branch1'];
  var branch2 = workbook.Sheets['branch2'];
// merge branch1 and branch2
  var slots = XLSX.utils.sheet_to_json(branch1);
  var slots2 = XLSX.utils.sheet_to_json(branch2);
  slots.push(slots2);

  fieldFixed(slots, slotSchema, slotNameMap);
  // delete object that (system || subsystem || beamlinePosition) is empty
  slots = slots.filter(function(x) {
    return x.system && x.subsystem && x.beamlinePosition ? true: false;
  });
  return slots;
}

/*
 validate field by schema
 slots: json object list
 */
function slotValidate(slots,callback) {
  var error;
  var slotModel = [];
  for(var i=0; i < slots.length; i++) {
    var sobj = new Slot(slots[i]);
    // convert string to ObjectId
    sobj.DRR = mongoose.Types.ObjectId(sobj.DRR);
    sobj.ARR = mongoose.Types.ObjectId(sobj.ARR);
    console.log('Validate ' + sobj.name);
    error = sobj.validateSync();
    // slotModel.push(sobj);
    if(error) {
      break;
    }else {
      console.log('Success.');
      slotModel.push(sobj);
    }
  }
  callback(error,slotModel);
}


/*
 save data to file
 data: the validated json object list
 fname: the file name
 */
function saveFile(data, fname) {
  var fs = require('fs');
  fs.writeFile(fname,JSON.stringify(data,null, 2), function(err) {
    if(err) {
      return console.error(err);
    }
    console.log('The data are saved in ' + fname);
  });
}


/*
 save data to mongoDB
 data: the validated json object list
 */
function saveModel(data, callback){
  var count = 0;
  data.forEach(function(x){
    x.save(function (err,doc){
      if (err) {
        console.error(err);
      }else {
        console.log(doc.name + ' saved');
      }
      count = count + 1;
      if(count ===data.length ){
        callback(count);
      }
    });
  })
}

module.exports = {
  getSlotJson: getSlotJson,
  slotValidate: slotValidate,
  saveFile: saveFile,
  saveModel: saveModel
};