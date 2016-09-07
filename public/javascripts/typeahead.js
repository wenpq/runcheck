/******
 * The Typeahead object provides Bloodhound objects for the application
 *
 *
 *
 ******/
/*global Bloodhound:false*/

var Typeahead = (function (parent) {

  var deviceList = new Bloodhound({
    datumTokenizer: function (device) {
      return Bloodhound.tokenizers.nonword(device.serialNo);
    },
    queryTokenizer: Bloodhound.tokenizers.nonword,
    identify: function (device) {
      return device._id;
    },
    prefetch: {
      url: '/devices/json',
      cacheKey: 'devices'
    },
    ttl: 1000 * 60 * 30
  });

  var slotList = new Bloodhound({
    datumTokenizer: function (slot) {
      return Bloodhound.tokenizers.nonword(slot.name);
    },
    queryTokenizer: Bloodhound.tokenizers.nonword,
    identify: function (slot) {
      return slot._id;
    },
    prefetch: {
      url: '/slots/json',
      cacheKey: 'slots'
    },
    ttl: 1000 * 60 * 30
  });

  deviceList.initialize();
  slotList.initialize();

  parent.deviceList = deviceList;
  parent.slotList = slotList;

  return parent;

}(Typeahead || {}));
