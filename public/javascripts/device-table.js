// device table function starts
function addFilterFoot(table, columns) {
  var tr = $('<tr role="row">');
  columns.forEach(function (c) {
    if (c.searching) {
      tr.append('<th><input type="text" placeholder="' + c.title + '" style="width:80%;" autocomplete="off"></th>');
    } else {
      tr.append('<th></th>');
    }
  });
  $(table).append($('<tfoot class="filter">').append(tr));
}

function personColumn(title, key) {
  return {
    title: title,
    data: key,
    defaultContent: '',
    render: function (data, type) {
      if (type === 'sort' || type === 'filter') {
        return data;
      } else if (data) {
        return '<img class="user-img" data-src="holder.js/27x40?size=20&text=' + data.substr(0, 1).toUpperCase() + '" src="/users/' + data + '/photo" title="' + data + '">';
      } else {
        return '';
      }
    },
    searching: true
  };
}

function selectEvent() {
  $('tbody').on('click', 'input.select-row', function (e) {
    if ($(this).prop('checked')) {
      $(e.target).closest('tr').addClass('row-selected');
    } else {
      $(e.target).closest('tr').removeClass('row-selected');
    }
  });
}


function filterEvent() {
  $('.filter').on('keyup', 'input', function (e) {
    var table = $(this).closest('table');
    var th = $(this).closest('th');
    var filter = $(this).closest('.filter');
    var index;
    if (filter.is('thead')) {
      index = $('thead.filter th', table).index(th);
      $('tfoot.filter th:nth-child(' + (index + 1) + ') input', table).val(this.value);
    } else {
      index = $('tfoot.filter th', table).index(th);
      $('thead.filter th:nth-child(' + (index + 1) + ') input', table).val(this.value);
    }
    table.DataTable().columns(index).search(this.value).draw();
  });
}

function progressBar(checkedValue,totalValue) {
  var w = '100px';
  var t = Math.round(checkedValue) + '/' + totalValue;
  var finished =  checkedValue / totalValue * 100;
  var bar;
  if(finished == 100) {
    bar = $('<div class="progress" style="width: ' + w + ';"><div class="progress-bar progress-bar-success" style="width:' + finished + '%;">' + t + '</div></div>');
  }else {
    if(finished < 50) {
      bar = $('<div class="progress" style="width: ' + w + ';"><div class="progress-bar progress-bar-info" style="width:' + finished + '%;"></div><div class="progress-value">' + t + '</div></div>');
    }else {
      bar = $('<div class="progress" style="width: ' + w + ';"><div class="progress-bar progress-bar-info" style="width:' + finished + '%;">' + t + '</div></div>');
    }
  }
  return bar[0].outerHTML;
}
//  device table function end


// device columns starts
var selectColumn = {
  title: '',
  defaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
  oderDataType: 'dom-checkbox',
  order: ['desc', 'asc']
};

var serialNoColumn = {
  title: 'serial No',
  defaultContent: 'unknown',
  data: 'serialNo',
  searching: true
};

var nameColumn = {
  title: 'Name',
  defaultContent: 'unknown',
  data: 'name',
  searching: true
};

var typeColumn = {
  title: 'Type',
  defaultContent: 'unknown',
  data: 'type',
  searching: true
};

var departmentColumn = {
  title: 'Department',
  defaultContent: 'unknown',
  data: 'department',
  searching: true
};

var ownerColumn = personColumn('Owner', 'owner');

var detailsColum = {
  title: 'Details',
  data: 'details',
  render: function (data) {
    return '<a href="' + '/details/' + data + '/" target="_blank" data-toggle="tooltip" title="go to the device details"><i class="fa fa-gear fa-lg"></i></a>';
  },
  order: false
};

var checklistColumn = {
  title: 'Checklist',
  data: 'checklist',
  render: function (data) {
    return '<a href="' + '/checklist/' + data + '/" target="_blank" data-toggle="tooltip" title="go to the checklist"><i class="fa fa fa-list fa-lg"></i></a>';
  },
  order: false
};

var checkedProgressColumn = {
  title: 'Checked progress',
  order: true,
  type: 'numeric',
  autoWidth: false,
  width: '105px',
  data: function (source) {
    return progressBar( source.checkedValue, source.totalValue);
  }
};
// device columns end


// dom variable starts
var domNoTools = "<'row'<'col-md-4'l><'col-md-4'<'text-center'r>><'col-md-4'f>>t<'row'<'col-md-6'i><'col-md-6'p>>";
// dom variable end


$(function () {
  var deviceColumns = [selectColumn, serialNoColumn, nameColumn, typeColumn, departmentColumn, ownerColumn, detailsColum, checklistColumn, checkedProgressColumn ];
  $('#device-table').DataTable({
    ajax: {
      url: '/devices/json'
    },
    initComplete: function () {
      /*Holder.run({
        images: 'img.user'
      });*/
      console.log('initComplete');
    },
    autoWidth: false,
    processing: true,
    pageLength: 10,
    lengthMenu: [
      [10, 50, 100, -1],
      [10, 50, 100, 'All']
    ],
    oLanguage: {
      loadingRecords: 'Please wait - loading data from the server ...'
    },
    deferRender: true,
    columns: deviceColumns,
    order: [
      [2, 'asc']
    ],
    dom: domNoTools
  });
  addFilterFoot('#device-table', deviceColumns);
  filterEvent();
  selectEvent();
});