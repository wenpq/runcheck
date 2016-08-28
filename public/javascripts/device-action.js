function dataRender(device){
  $('#dName').text(device.name);
  $('#dSerialNo').text(device.serialNo);
  $('#dType').text(device.type);
  $('#dDepartment').text(device.department);
  $('#dOwner').text(device.owner);

  if(device.installToSlot) {
    var s = 'Slot:<a href="/slots/' + device.installToSlot + '">' + device.installToSlot + '<a>';
    $('#dInstallTo').html(s);
  }else if(device.installToDevice) {
    s = 'Device:<a href="/devices/' + device.installToDevice + '">' + device.installToDevice + '<a>';
    $('#dInstallTo').html(s);
  }else{
    $('#dInstallTo').html('Spare');
  }

  // show status
  var status = device.status;
  var styleMap = {
    '0': 'warning',
    '1': 'info',
    '1.5': 'info',
    '2': 'info',
    '3': 'success'
  };
  var statusMap = {
    '0': 'Spare',
    '1': 'Prepare to install',
    '1.5': 'Prepare installation checklist',
    '2': 'approved to install',
    '3': 'installed'
  };
  $('#dStatus').text(statusMap[status]);
  $('#dStatus').removeClass();
  $('#dStatus').addClass(styleMap[status]);
  $('#preparePanel').hide();

  // hide buttons
  // TODO: get the role
  var role = 'AM';
  disableButton(status, role);
}

/**
 * disable buttons by status and role
 * @param status
 * @param role DO: device owner AM: area manger
 */
function disableButton(status, role) {
  //TODO: confirm all the roles, and disable buttons by role.
  if(role == 'AM') {
    if(status === 0) {
      $('#approveInstall').attr('disabled','disabled');
      $('#rejectInstall').attr('disabled','disabled');
      $('#install').attr('disabled','disabled');
    }
    if(status === 1 ) {
      $('#preInstall').attr('disabled','disabled');
      $('#install').attr('disabled','disabled');
    }
    if(status === 1.5) {
      $('#preInstall').attr('disabled','disabled');
      $('#install').attr('disabled','disabled');
    }
    if(status === 2) {
      $('#preInstall').attr('disabled','disabled');
      $('#approveInstall').attr('disabled','disabled');
      $('#rejectInstall').attr('disabled','disabled');
    }
    if(status === 3) {
      $('#preInstall').attr('disabled','disabled');
      $('#approveInstall').attr('disabled','disabled');
      $('#rejectInstall').attr('disabled','disabled');
      $('#install').attr('disabled','disabled');
    }
  }
}

$(function () {
  var device = JSON.parse($('#device').text());
  dataRender(device );
});

var nameMap;
var installTo;
$('.prepare-install').click(function () {
  var url;
  var att;
  nameMap = {};
  if ($(this).text() === 'slot') {
    $('#prepareTitle').text('Prepare to be installed to Slot');
    $('#prepareLabel').text('Slot Name:');
    url = '/slots/json/names';
    installTo = 'installToSlot';
    att = 'name'
  }else{
    $('#prepareTitle').text('Prepare to be installed to Device: ');
    $('#prepareLabel').text('Device serial number:');
    url = '/devices/json/serialNos';
    installTo = 'installToDevice';
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
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button> Get slot or device name list failed. ' + jqXHR.responseText +  '</div>');
  });
  $('#preparePanel').show();
});

$('#prepareConfirm').click(function (e) {
  e.preventDefault();
  var name = $('#prepareInput').val().trim();
  var targetId = nameMap[name];// get id by name
  if(!targetId) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + name + ' not found.</div>');
    return;
  }
  var url = window.location.pathname + '/' + installTo +  '/' + targetId ;
  $.ajax({
    url: url,
    type: 'PUT'
  }).done(function (data) {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button> Prepare to install success.</div>');
    // refresh page
    dataRender(data)
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + jqXHR.responseText +  '</div>');
  });
});

$('#rejectInstall').click(function (e) {
  e.preventDefault();
  $.ajax({
    url: window.location.pathname ,
    type: 'PUT'
  }).done(function () {

  }).fail(function (jqXHR) {

  });
});

$('#prepareCancel').click(function () {
  $('#preparePanel').hide();
});


