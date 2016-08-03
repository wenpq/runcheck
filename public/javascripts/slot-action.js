$('#addGroup').click(function (e) {
  e.preventDefault();
  if ($('.row-selected').length == 0) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select at least one slot.</div>');
    return;
  }
  var slotGroup = $('select').val();
  if(slotGroup === 'Select') {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Please select one slots group.</div>');
    return;
  }
  // get slot object list
  var slots = [];
  $('.row-selected').each(function() {
    var href = $(this).closest('tr').children().eq(1).children().attr('href');
    slots.push(href.split('/')[2]);
  });
  $.ajax({
    url: './AddGroupValidate',
    type: 'Post',
    contentType: 'application/json',
    data: JSON.stringify({
      slots: slots,
      slotGroup: slotGroup
    })
  }).done(function (data, status, jqXHR) {
    if(data.rejectData) {
      $('.modal-body .panel').addClass('panel-warning');
      $('.modal-body .panel .panel-heading').text('Warning: Group conflict! the following slots are already in other group.');
      var warning = '';
      data.rejectData.forEach(function(x){
        warning = warning + '<div class="panel-body">' + x + '</div>';
      });
      $('.modal-body .panel').append(warning);
    }
    $('#modal .modal-footer').html('<button value="submit" class="btn btn-primary" data-dismiss="modal">Submit</button><button data-dismiss="modal" aria-hidden="true" class="btn">Cancel</button>');
    $('#modal').modal('show');
/*    $('#modalLabel').html('Add slots to slot groups: ' + $('select').val());
    $('#modal .modal-body').html(data.passData);
    $('#modal .modal-footer').html('<button value="submit" class="btn btn-primary" data-dismiss="modal">Submit</button><button data-dismiss="modal" aria-hidden="true" class="btn">Cancel</button>');
    $('#modal').modal('show');*/
  }).fail(function (jqXHR) {

  });

});