var statusMap = {
  '0': 'Spare',
  '1': 'Prepare to install',
  '1.5': 'Prepare installation checklist',
  '2': 'approved to install',
  '3': 'installed'
};

$(function () {
  // show status and buttons
  var status = $('#deviceStatus td').text();
  var infoStyle;
  if(status === '0') {
    $('#preInstall').removeAttr('disabled');
    infoStyle = 'warning';
  }
  if(status === '1' ) {
    infoStyle = 'info';
    $('#approve-nstall').removeAttr('disabled');
  }
  if(status === '1.5') {
    infoStyle = 'info';
    $('#approveInstall').removeAttr('disabled');
  }
  if(status === '2') {
    infoStyle = 'info';
    $('#install').removeAttr('disabled');
  }
  if(status === '3') {
    infoStyle = 'success';
  }
  $('#deviceStatus td').text(statusMap[status]);
  $('#deviceStatus').addClass(infoStyle);
  $('#preparePanel').hide();
});

var nameMap;
$('.prepare-install').click(function () {
  var url;
  var att;
  nameMap = {};
  if ($(this).text() === 'slot') {
    $('#prepareTitle').text('Prepare to be installed to Slot');
    $('#prepareLabel').text('Slot Name: ');
    url = '/slots/json/names';
    att = 'name'
  }else{
    $('#prepareTitle').text('Prepare to be installed to Device: ');
    $('#prepareLabel').text('Device serial number: ');
    url = '/devices/json/serialNos';
    att = 'serialNo'
  }
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (data) {
    var namelist = [];
    for(var i = 0; i < data.length; i++){
      namelist.push(data[i][att]);
      nameMap[data[i][att]] = data[i]._id;
    }
    $('#prepareInput').typeahead({ source: namelist});
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button> Get slot or devce name list failed, ' + jqXHR.responseText +  '</div>');
  });
  $('#preparePanel').show();
});

$('#prepareConfirm').click(function () {
  var name = $('#prepareInput').val().trim();
  var targetId = nameMap[name];// get id by name
  if(!targetId) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + name + ' not found.</div>');
    return;
  }
  var url;
  if ($('.prepare-install').text() === 'slot') {
    url = window.location.pathname + '/slot/' + targetId ;
  }else{
    url = window.location.pathname + '/device/' + targetId ;
  }
  $.ajax({
    url: url,
    type: 'PUT'
  }).done(function () {
    $('#message').append('<div class="alert alert-sucess"><button class="close" data-dismiss="alert">x</button> prepare to install this device, waiting for approved.</div>');
    $('#preparePanel').hide();
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button> Can not prepare to install this device, ' + jqXHR.responseText +  '</div>');
  });
});

$('#prepareCancel').click(function () {
  $('#preparePanel').hide();
});


