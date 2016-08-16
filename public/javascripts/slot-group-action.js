var passData;
$('#remove').click(function (e) {
  e.preventDefault();
  if ($('.row-selected').length == 0) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select at least one slot.</div>');
    return;
  }
  var selectedData = []; // no validation for removing, passData equals selectedData
  $('.row-selected').each(function() {
    var href = $(this).closest('tr').children().eq(1).children().attr('href');
    var name = $(this).closest('tr').children().eq(2).text();
    selectedData.push({
      id: href.split('/')[2],
      name: name
    });
  });
  passData = selectedData;

  $('#modalLabel').html('Remove Slots form current group?');
  var footer = '<button id="modal-submit" class="btn btn-primary" data-dismiss="modal">Confirm</button>' +
    '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
  $('#modal .modal-footer').html(footer);
  $('#modal').modal('show');
});

$('#modal').on('click','#modal-cancel',function (e) {
  e.preventDefault();
  reset();
});

$('#modal').on('click','#modal-submit',function (e) {
  e.preventDefault();
  var url = window.location.href + '/removeSlots';
  $.ajax({
    url: url,
    type: 'Post',
    contentType: 'application/json',
    data: JSON.stringify({
      passData: passData,
    })
  }).done(function (data) {
    if(data.doneMsg.length) {
      var s = '';
      for(var i = 0; i < data.doneMsg.length; i++){
        s =  s + data.doneMsg[i]+ '<br>';
      }
      $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>' +  s +'</div>');
    }
    if(data.errMsg.length) {
      var es = '';
      for(i = 0; i < data.errMsg.length; i++){
        es =  es + data.errMsg[i]+ '<br>';
      }
      $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' +  es +'</div>');
    }
    reloadTable();
    reset();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' +  jqXHR.responseText + '</div>');
    reloadTable();
    reset();
  });
});

function reset() {
  $('.modal-body').html( '<div class="panel"> ' +
    '<div class="panel-heading"></div> ' +
    '</div>' +
    '<form class="form-inline"> ' +
    '<label>Please select one slot group:</label> ' +
    '<select class="form-control"></select> ' +
    '</form>');
  passData = null;
}

function reloadTable() {
  $('#spec-slots-table').DataTable().ajax.reload();
}