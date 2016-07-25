$(function () {
  $('#roles input:checkbox').change(function () {
    $('#roles input:checkbox').prop('disabled', true);
    var roles = [];
    $('#roles input:checked').each(function () {
      roles.push($(this).prop('name'));
    });
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        roles: roles
      })
    }).done(function () {
    }).fail(function () {
    }).always(function () {
    });
  })
});
