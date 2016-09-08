var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var slot = new Schema({
  system: String,
  subsystem: String,
  deviceNaming: String,// mapping to 'Device' column in slot excel file
  beamlinePosition: Number,// Beam line position (dm)
  name: {
    type: String,
    index: true,
    unique: true
  },
  deviceType: String,
  elementName: String,
  level: {
    type: String,
    default: 'Low',
    enum: ['Low', 'Medium', 'High']
  },
  DRR: String,
  ARR: String,
  InnerDiameter: String,// Minimum Beam Pipe Inner Diameter (mm)
  flangeLength: Number,// Element Flange to Flange Length (m)
  placeHolder: Number,
  effectiveLength: Number,// Element Effective Length (m)
  coordinateX: Number,// Global Coordinate X (m)
  coordinateY: Number,
  coordinateZ: Number,
  center2centerLength: Number,// Accumulated center-to-center Length (m)
  end2endLength: Number,// Accumulated end-to-end Length (m)
  comment: String,
  artemisDistance: Number,// Distance from Artemis source (m) ???

  // the following attributes not in slot excel file
  owner: String,
  area: String,
  device: ObjectId,
  approvalStatus: {
    type: Boolean,
    default: false
  },
  machineMode: String,
  inGroup: ObjectId
});

var Slot = mongoose.model('Slot', slot);

module.exports = {
  Slot: Slot
};
