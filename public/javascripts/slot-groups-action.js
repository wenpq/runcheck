$('#new').click(function (e) {
  e.preventDefault();
  $('#modal').modal('show');
});

$('#c-cancel').click(function (e) {
  e.preventDefault();
  $('#modal').modal('hide');
});

$('#c-confirm').click(function (e) {
  e.preventDefault();
  var name = $('#c-name').val();
  var area = $('#c-area').val();
  var description = $('#c-description').val();
  if(!name || !area) {
    $('#message2').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Both group name and area are required.</div>');
    return;
  }
  $.ajax({
    url: '/slotGroups/new',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      name: name,
      area: area,
      description:  description
    })
  }).done(function (data, status, jqXHR) {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Success: ' +  jqXHR.responseText + '</div>');
    $('#slot-groups-table').DataTable().ajax.reload();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Failed: ' +  jqXHR.responseText + '</div>');
  }).always(function(){
    $('#modal').modal('hide');
  });
});