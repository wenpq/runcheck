/******
 * The History object provides access to history-related functions
 *
 *
 *
 ******/
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

  parent.renderHistory = renderHistory;

  return parent;

}(History || {}, jQuery));
