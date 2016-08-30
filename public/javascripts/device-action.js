var statusMap = {
  '0': 'Spare',
  '1': 'Prepare to install',
  '1.5': 'Prepare installation checklist',
  '2': 'approved to install',
  '3': 'installed'
};
var nameMap;
var installTo;
var device;
var oldId;

/**
 * render page styles
 * @param data:  device json
 */
function dataRender(data){
  $('#dName').text(data.name);
  $('#dSerialNo').text(data.serialNo);
  $('#dType').text(data.type);
  $('#dDepartment').text(data.department);
  $('#dOwner').text(data.owner);

  if(data.installToSlot) {
    var s = 'Slot:<a href="/slots/' + data.installToSlot + '">' + data.installToSlot + '</a>';
    $('#dInstallTo').html(s);
  }else if(data.installToDevice) {
    s = 'Device:<a href="/devices/' + data.installToDevice + '">' + data.installToDevice + '</a>';
    $('#dInstallTo').html(s);
  }else{
    $('#dInstallTo').html('Spare');
  }

  // show status
  var status = data.status;
  var styleMap = {
    '0': 'warning',
    '1': 'info',
    '1.5': 'info',
    '2': 'info',
    '3': 'success'
  };
  $('#dStatus').text(statusMap[status]).removeClass().addClass(styleMap[status]);
  $('#preparePanel').hide();

  // hide buttons
  $('#preInstall').removeAttr('disabled');
  $('#approveInstall').removeAttr('disabled');
  $('#rejectInstall').removeAttr('disabled');
  $('#install').removeAttr('disabled');
  $('#setSpare').removeAttr('disabled');
  var role = 'AM';
  disableButton(status, role); // TODO: get the role
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
      $('#setSpare').attr('disabled','disabled');
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


/**
 * set installTo and oldId
 */
function getInstalltoId(){
  oldId = device.installToSlot ? device.installToSlot: device.installToDevice;
  if (device.installToSlot) {
    installTo = 'installToSlot';
    oldId = device.installToSlot;
  }else if(device.installToDevice) {
    installTo = 'installToDevice';
    oldId = device.installToDevice;
  }else {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>Must have one and only one ID of installToDevice and installToSlot.</div>');
    return;
  }
}


/**
 * call ajax to change device status
 * @param installTo   field name, 'installToSlot' or 'installToDevce'
 * @param oldId       content of installToSlot or installToDevce
 * @param newId       content of  installToSlot or installToDevce
 * @param oldStatus
 * @param newStatus
 */
function changeStatus(installTo, oldId, newId, oldStatus, newStatus) {
  var url = window.location.pathname + '/' + installTo +  '/' + oldId + '/' + newId + '/status/' + oldStatus + '/' + newStatus;
  $.ajax({
    url: url ,
    type: 'PUT'
  }).done(function (data) {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>Device status become ' + statusMap[newStatus] + '</div>');
    device = data;
    $('#device').text(JSON.stringify(data));
    dataRender(device)
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + jqXHR.responseText +  '</div>');
  });
}


$('.prepare-install').click(function () {
  var url;
  var att;
  nameMap = {};
  if ($(this).text() === 'slot') {
    $('#prepareTitle').text('Prepare to install to Slot');
    $('#prepareLabel').text('Slot Name:');
    url = '/slots/json/names';
    installTo = 'installToSlot';
    att = 'name'
  }else{
    $('#prepareTitle').text('Prepare to install to Device: ');
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
    $('#prepareInput').typeahead('destroy');
    $('#prepareInput').typeahead({ source: namelist});
  }).fail(function (jqXHR) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button> Get slot or device name list failed. ' + jqXHR.responseText +  '</div>');
  });
  $('#preparePanel').show();
});


$('#prepareConfirm').click(function (e) {
  e.preventDefault();
  var name = $('#prepareInput').val().trim();
  var newId = nameMap[name];// get id by name
  if(!newId) {
    $('#message').append('<div class="alert alert-danger"><button class="close" data-dismiss="alert">x</button>' + name + ' not found.</div>');
    return;
  }
  changeStatus(installTo, 'null', newId, 0, 1);
});


$('#rejectInstall').click(function (e) {
  e.preventDefault();
  getInstalltoId();
  changeStatus(installTo, oldId, 'null', device.status, 0);
});


$('#setSpare').click(function (e) {
  e.preventDefault();
  getInstalltoId();
  changeStatus(installTo, oldId, 'null', device.status, 0);
});

$('#approveInstall').click(function (e) {
  e.preventDefault();
  getInstalltoId();
  changeStatus(installTo, oldId, oldId, 1, 2)
});


$('#install').click(function (e) {
  e.preventDefault();
  getInstalltoId();
  changeStatus(installTo, oldId, oldId, 2, 3)
});


$('#prepareCancel').click(function (e) {
  e.preventDefault();
  $('#preparePanel').hide();
});


$(function () {
  device = JSON.parse($('#device').text());
  dataRender(device);
});