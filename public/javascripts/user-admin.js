$(function () {
  $('form input,select').change(function () {
    $('#update').prop('disabled', false);
  });
  var binder = new Binder.FormBinder(document.forms[0]);
  var model = binder.serialize();
  $('#update').click(function (e) {
    e.preventDefault();
    var data = binder.serialize();
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function (json) {
      // display a message
      // update history
      binder.deserialize(json);
      model = json;
    }).fail(function () {
      // display a message
      // update history
    }).always(function () {
      $('#update').prop('disabled', false);
    });
  });
  $('#reset').click(function (e) {
    e.preventDefault();
    binder.deserialize(model);
    $('#update').prop('disabled', true);
  });
});
