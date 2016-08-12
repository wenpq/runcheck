$(function () {
  $('form input,select').change(function () {
    $('#update').prop('disabled', false);
  });
  $('#update').click(function () {
    var data = {
      roles: {
        admin: $('checkbox[name="roles.admin"]').prop('checked'),
        leader: $('checkbox[name="roles.leader"]').prop('checked')
      },
      expert: $('input[name="subject"]').val() === '' ? undefined : $('input[name="subject"]').val()
    };
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function () {
      // display a message
      // update history
    }).fail(function () {
      // display a message
      // update history
    }).always(function () {
      $('#update').prop('disabled', false);
    });
  });
});
