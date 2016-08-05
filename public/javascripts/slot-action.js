var validateSlot;
var slotGroupName;

$('#addGroup').click(function (e) {
  e.preventDefault();
  if ($('.row-selected').length == 0) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select at least one slot.</div>');
    return;
  }

  $.ajax({
    url: '/slotGroups/json',
    contentType: 'application/json'
  }).done(function (data) {
    $('#modalLabel').html('Add slots to slot group');
    var option = '<option>...</option>';
    data.forEach(function(d) {
      option = option + '<option>' + d.name + '</option>';
    });
    $('.modal-body select').html(option);
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>');
    $('#modal').modal('show');
  }).fail(function (jqXHR) {
    reset();
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Cannot Add to Group: ' + jqXHR.responseText +  '</div>');
  });


  $('.modal-body select').change('change',function(){
    slotGroupName = $(this).val();
    if (slotGroupName === '...') return;
    // get slot object list
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
        slotIds: slotIds,
      })
    }).done(function (data) {
      validateSlot = data;
      var panelClass;
      var panel;
      var footer;
      if(data.rejectDataName.length === slotIds.length) {
        panelClass = 'panel-danger';
        panel = '<div class="panel-heading">Error: Group conflict! All slots have been in other groups.</div>';
        footer = '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
      }else if(data.rejectDataName.length > 0) {
        panelClass = 'panel-warning';
        var heading = '<div class="panel-heading">Warning: Group conflict! the following slots have been in other groups.</div>';
        var warning = '';
        data.rejectDataName.forEach(function(x){
          warning = warning + '<div class="panel-body">' + x+ '</div>';
        });
        panel = heading + warning;
        footer = '<button id="modal-add" class="btn btn-primary" data-dismiss="modal">Add anyway</button>' +
          '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
      }else {
        panelClass = 'panel-success';
        panel = '<div class="panel-heading">Success: All slots can be added.</div>';
        footer = '<button id="modal-add" class="btn btn-primary" data-dismiss="modal">Add</button>' +
          '<button data-dismiss="modal" aria-hidden="true" class="btn" id="modal-cancel">Cancel</button>';
      }
      $('.modal-body .panel').addClass(panelClass);
      $('.modal-body .panel').html(panel);
      $('#modal .modal-footer').html(footer);

    }).fail(function (jqXHR) {
      reset();
      $('#modal').modal('hide');
      $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Cannot Add to Group: ' + jqXHR.responseText +  '</div>');
    });
  });
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
      slotIds: validateSlot.passDataId,
      slotGroupName: slotGroupName
    })
  }).done(function () {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Success: add slots to group </div>');
    reset();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Cannot Add to Group: ' + jqXHR.responseText +  '</div>');
    reset();
  });
});

function reset() {
  $('.modal-body').html('<form class="form-inline"> ' +
    '<label>Please select one slot group:</label> ' +
    '<select class="form-control"></select> ' +
    '</form> ' +
    '<div class="panel"> ' +
    '<div class="panel-heading"></div> ' +
    '</div>');
}
