$(function () {
  $('#roles input:checkbox').change(function () {
    $('#roles input:checkbox').prop('disabled', true);
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        update: {
          role: $(this).prop('name'),
          val: $(this).prop('checked')
        }
      })
    }).done(function () {
      // display a message
      // update history
    }).fail(function () {
      // display a message
      // update history
    }).always(function () {
      $('#roles input:checkbox').prop('disabled', false);
    });
  })
});
