var passData;
var selectGroupId;
$('#remove').click(function (e) {
  e.preventDefault();
  if ($('.row-selected').length == 0) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select at least one slot.</div>');
    return;
  }
  $('#modalLabel').html('Remove Slots form current group');
  $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>');

  var selectedData = []; // no validation for removing, passData equals selectedData
  $('.row-selected').each(function() {
    var href = $(this).closest('tr').children().eq(1).children().attr('href');
    var name = $(this).closest('tr').children().eq(2).val();
    selectedData.push({
      id: href.split('/')[2],
      name: name
    });
  });
  passData = selectedData;
  // select option
  $.ajax({
    url: '/slotGroups/json',
    type: 'GET',
    dataType: 'json'
  }).done(function (data) {
    var option = '<option>...</option>';
    data.forEach(function(d) {
      option = option + '<option name="' +d._id + '">' + d.name + '</option>';
    });
    $('.modal-body select').html(option);
    $('#modal').modal('show');
  }).fail(function (jqXHR) {
    $('#modal').modal('hide');
    reset();
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button> Get slot groups field ' + jqXHR.responseText +  '</div>');
  });
});

// not show submit button until group selected in add group functon
$('.modal-body').on('change', 'select', function() {
  selectGroupId = $('option:selected').attr('name');
  var footer = '<button id="modal-submit" class="btn btn-primary" data-dismiss="modal">Submt</button>' +
    '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
  $('#modal .modal-footer').html(footer);
});

$('#modal').on('click','#modal-cancel',function (e) {
  e.preventDefault();
  reset();
});

$('#modal').on('click','#modal-submit',function (e) {
  e.preventDefault();
  for (var i=0; i< passData.length; i++) {
    var url = '/slotGroups/' + selectGroupId + '/slot/' + passData[i].id;
    (function (i) {
      $.ajax({
        url: url,
        type: 'DELETE'
      }).done(function () {
        $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Success: ' + passData[i].name  + ' is removed.</div>');
        if(i==passData.length-1)reset();
      }).fail(function (jqXHR) {
        $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + 'Error: ' + jqXHR.responseText + '. remove ' + passData[i].name + ' field.</div>');
        if(i==passData.length-1)reset();
      });
    })(i);
  }
});

function reset() {
  $('.modal-body').html( '<div class="panel"> ' +
    '<div class="panel-heading"></div> ' +
    '</div>' +
    '<form class="form-inline"> ' +
    '<label>Please select one slot group:</label> ' +
    '<select class="form-control"></select> ' +
    '</form>');
  $('.row-selected input').prop('checked', false);
  $('.row-selected').removeClass('row-selected');
  passData = null;
  selectGroupId = null;
}
