var XLSX = require('xlsx');
var sutil = require('./utils');
var Slot = require('../models/slot').Slot;
var slotSchema = require('../models/slot').slotSchema;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/runcheck');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongodb://localhost/runcheck connected.');
});

var slotFieldList =   [ ['system', 'System'],
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

/*                  read slot data               */
var workbook = XLSX.readFile('slot-data.xlsx');
var branch1 = workbook.Sheets['branch1'];
var branch2 = workbook.Sheets['branch2'];
// merge branch1 and branch2
var slots = XLSX.utils.sheet_to_json(branch1);
var slots2 = XLSX.utils.sheet_to_json(branch2);
slots.push(slots2);

sutil.fieldFixed(slots, slotSchema, slotFieldList);
// delete object that (system || subsystem || beamlinePosition) is empty
slots = slots.filter(function(x) {
  return x.system && x.subsystem && x.beamlinePosition ? true: false;
});


/*for(var i=0; i<slots.length; i++) {
  var sobj = new Slot(slots[i]);
  sobj.DRR = mongoose.Types.ObjectId(sobj.DRR);
  sobj.ARR = mongoose.Types.ObjectId(sobj.ARR);
  sobj.save(function (err) {
    if (err) {
      console.error(err);
      db.close();
      process.exit(1);
    }
  });
}*/

slots.forEach(function(s) {
  var sobj = new Slot(s);
  sobj.DRR = mongoose.Types.ObjectId(sobj.DRR);
  sobj.ARR = mongoose.Types.ObjectId(sobj.ARR);
  sobj.save(function (err) {
    if (err) {
      console.error(err);
      db.close();
      process.exit(1);
    }
  });
});


