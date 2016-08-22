/******
 * The History object provides access to history-related functions
 *
 *
 *
 ******/
/*global moment:false, changeTemplate:false*/

var History = (function (parent, $) {

  function renderHistory(updates, selector) {
    selector = typeof selector === 'undefined' ? '#history' : selector;
    if (updates && updates.length > 1) {
      $(selector).empty();
      updates.forEach(function (u) {
        $(selector).prepend(changeTemplate({
          h: u,
          moment: moment
        }));
      });
    }
  }

  function prependHistory(updates, selector) {
    selector = typeof selector === 'undefined' ? '#history' : selector;
    var changeIds = [];
    $(selector).children('.change').each(function () {
      changeIds.push($(this).prop('id'));
    });
    if (updates && updates.length > 1) {
      updates.forEach(function (u) {
        if (changeIds.indexOf(u._id) === -1) {
          $(selector).prepend(changeTemplate({
            h: u,
            moment: moment
          }));
        }
      });
    }
  }

  parent.renderHistory = renderHistory;
  parent.prependHistory = prependHistory;

  return parent;

}(History || {}, jQuery));
