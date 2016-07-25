$(function () {
  $('#roles input:checkbox').change(function () {
    $('#roles input:checkbox').disabled();
    var roles = [];
    $('#roles input:checked').each(function () {
      roles.push($(this).name);
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
