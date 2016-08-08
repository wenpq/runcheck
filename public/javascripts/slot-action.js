var passDataId;
var slotGroupName;
var buttonId;
$('.group-edit').click(function (e) {
  e.preventDefault();
  buttonId = $(this).attr('id');

  var url, sLabel, sError, sWarning, sSuccess, sField;
  if (buttonId === 'addGroup') {
    url = './addGroupValidate';
    sLabel = 'Add slots to slot group';
    sError = 'Error: group conflict! All slots have been in other groups.';
    sWarning = 'Warning: group conflict! the following slots have been in other groups.';
    sSuccess = 'Success: All slots can be added.';
    sField = 'Cannot add slots to Group: ';
  }else {
    url = './removeGroupValidate';
    sLabel = 'Remove slots from slot group';
    sError = 'Error: slots do not belong to any group.';
    sWarning = 'Warning: the following slots do not belong to any group.';
    sSuccess = 'Success: all slots can be removed.';
    sField = 'Cannot remove slots from Group: ';
  }

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
    url: url,
    type: 'Post',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      slotIds: slotIds
    })
  }).done(function (data) {
    $('#modalLabel').html(sLabel);
    // panel and footer
    passDataId = data.passDataId;
    var panelClass;
    var panel;
    if(data.passDataId.length === 0) {
      panelClass = 'panel-danger';
      var heading = '<div class="panel-heading">' + sError + '</div>';
      var warning = '';
      data.conflictDataName.forEach(function(x){
        if (buttonId === 'addGroup') {
          warning = warning + '<div class="panel-body">' + x.slot + ' in ' + x.conflictGroup + ' group.</div>'
        }else {
          warning = warning + '<div class="panel-body">' + x.slot + ' group.</div>'
        }
      });
      panel = heading + warning;
    }else if(data.conflictDataName.length > 0) {
      panelClass = 'panel-warning';
      heading = '<div class="panel-heading">' + sWarning + '</div>';
      warning = '';
      data.conflictDataName.forEach(function(x){
        if (buttonId === 'addGroup') {
          warning = warning + '<div class="panel-body">' + x.slot + ' in ' + x.conflictGroup + ' group.</div>'
        }else {
          warning = warning + '<div class="panel-body">' + x.slot + ' group.</div>'
        }
      });
      panel = heading + warning;
    }else {
      panelClass = 'panel-success';
      panel = '<div class="panel-heading">' + sSuccess + '</div>';
    }

    if (buttonId !== 'addGroup' && passDataId.length !== 0) {
      footer = '<button id="modal-submit" class="btn btn-primary" data-dismiss="modal">Submt</button>' +
        '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
    }else {
      var footer = '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
    }
    $('.modal-body .panel').addClass(panelClass);
    $('.modal-body .panel').html(panel);
    $('#modal .modal-footer').html(footer);
    // only add group need to show selection
    if (buttonId === 'addGroup' && passDataId.length !== 0) {
      // select option
      var option = '<option>...</option>';
      data.groupOption.forEach(function(d) {
        option = option + '<option>' + d.name + '</option>';
      });
      $('.modal-body select').html(option);
    }else {
      $('.modal-body .form-inline').hide();
    }

    $('#modal').modal('show');
  }).fail(function (jqXHR) {
    $('#modal').modal('hide');
    reset();
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + sField + jqXHR.responseText +  '</div>');
  });
});

// not show submit button until group selected in add group functon
$('.modal-body').on('change', 'select', function() {
  slotGroupName = $(this).val();
  if (passDataId.length !== 0) {
    var footer = '<button id="modal-submit" class="btn btn-primary" data-dismiss="modal">Submt</button>' +
      '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
    $('#modal .modal-footer').html(footer);
  }
});

$('#modal').on('click','#modal-cancel',function (e) {
  e.preventDefault();
  reset();
});

$('#modal').on('click','#modal-submit',function (e) {
  e.preventDefault();
  var url, sDone, sField;
  if(buttonId === 'addGroup') {
    url = './addGroup';
    sDone = ' slots have been added in ' + slotGroupName;
    sField = 'Cannot add to Group: '
  }else {
    url = './removeGroup';
    sDone = ' slots have been Removed.';
    sField = 'Cannot remove from Group: ';
  }
  $.ajax({
    url: url,
    type: 'Post',
    contentType: 'application/json',
    data: JSON.stringify({
      slotIds: passDataId,
      slotGroupName: slotGroupName
    })
  }).done(function () {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Success: ' + passDataId.length  + sDone + '.</div>');
    reset();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + sField + jqXHR.responseText +  '</div>');
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
  passDataId = null;
  slotGroupName = null;
  buttonId = null;
}

