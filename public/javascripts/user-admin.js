$(function () {
  $('form input,select').change(function () {
    $('#update').prop('disabled', false);
  });
  $('#update').click(function (e) {
    e.preventDefault();
    var data = {
      roles: {
        admin: $('input[name="roles.admin"]').prop('checked'),
        leader: $('input[name="roles.leader"]').prop('checked')
      },
      expert: $('select[name="expert"]').val() === '' ? null : $('select[name="expert"]').val()
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
  $('#reset').click(function () {
    $('#update').prop('disabled', true);
  });
});
