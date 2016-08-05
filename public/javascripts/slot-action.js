var passDataId;
var slotGroupName;

$('#addGroup').click(function (e) {
  e.preventDefault();
  if ($('.row-selected').length == 0) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select at least one slot.</div>');
    return;
  }

  var slotIds = [];
  $('.row-selected').each(function() {
    var href = $(this).closest('tr').children().eq(1).children().attr('href');
    slotIds.push(href.split('/')[2]);
  });
  $.ajax({
    url: './addGroupValidate',
    type: 'Post',
    contentType: 'application/json',
    data: JSON.stringify({
      slotIds: slotIds
    })
  }).done(function (data) {
    $('#modalLabel').html('Add slots to slot group');
    // panel and footer
    passDataId = data.passDataId;
    var panelClass;
    var panel;
    var footer = '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
    if(data.passDataId.length === 0) {
      panelClass = 'panel-danger';
      var heading = '<div class="panel-heading">Error: Group conflict! All slots have been in other groups.</div>';
      var warning = '';
      data.rejectDataName.forEach(function(x){
        warning = warning + '<div class="panel-body">' + x.slot + ' in ' + x.conflictGroup + ' group.</div>';
      });
      panel = heading + warning;
    }else if(data.rejectDataName.length > 0) {
      panelClass = 'panel-warning';
      heading = '<div class="panel-heading">Warning: Group conflict! the following slots have been in other groups.</div>';
      warning = '';
      data.rejectDataName.forEach(function(x){
        warning = warning + '<div class="panel-body">' + x.slot + ' in ' + x.conflictGroup + ' group.</div>';
      });
      panel = heading + warning;
    }else {
      panelClass = 'panel-success';
      panel = '<div class="panel-heading">Success: All slots can be added.</div>';
    }
    $('.modal-body .panel').addClass(panelClass);
    $('.modal-body .panel').html(panel);
    $('#modal .modal-footer').html(footer);
    // select option
    var option = '<option>...</option>';
    data.groupOption.forEach(function(d) {
      option = option + '<option>' + d.name + '</option>';
    });
    $('.modal-body select').html(option);
    $('#modal').modal('show');
  }).fail(function (jqXHR) {
    $('#modal').modal('hide');
    reset();
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Cannot Add to Group: ' + jqXHR.responseText +  '</div>');
  });
});

$('.modal-body').on('change', 'select', function() {
  slotGroupName = $(this).val();
  if (passDataId.length !== 0) {
    var footer = '<button id="modal-add" class="btn btn-primary" data-dismiss="modal">Add</button>' +
      '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
    $('#modal .modal-footer').html(footer);
  }
});

$('#modal').on('click','#modal-cancel',function (e) {
  e.preventDefault();
  reset();
});

$('#modal').on('click','#modal-add',function (e) {
  e.preventDefault();
  $.ajax({
    url: './addGroup',
    type: 'Post',
    contentType: 'application/json',
    data: JSON.stringify({
      slotIds: passDataId,
      slotGroupName: slotGroupName
    })
  }).done(function () {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Success: ' + passDataId.length  + ' slots have been added in ' + slotGroupName + '.</div>');
    reset();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Cannot Add to Group: ' + jqXHR.responseText +  '</div>');
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
  $('.row-selected input').prop('checked', false);
  $('.row-selected').removeClass('row-selected');
}
