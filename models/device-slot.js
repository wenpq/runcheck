var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * deviceSlot is used to commit transaction of device install to slot
 */
var deviceSlot = new Schema({
  deviceId: ObjectId,
  slotId: ObjectId
});

deviceSlot.index({ deviceId: 1, soltId: 1}, { unique: true });

var DeviceSlot= mongoose.model('DeviceSlot', deviceSlot);

module.exports = {
  DeviceSlot: DeviceSlot
};