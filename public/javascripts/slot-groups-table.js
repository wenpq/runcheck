/*global Table: false, Holder: false*/

// slotGroup columns starts
var detailsColum = {
  title: 'Details',
  data: '_id',
  render: function (data) {
    return '<a href="' + '/slotGroups/' + data + '" target="_blank" data-toggle="tooltip" title="go to the slots group details"><i class="fa fa-list-alt fa-2x"></i></a>';
  },
  order: false
};

var nameColumn = {
  title: 'Name',
  defaultContent: 'unknown',
  data: 'name',
  searching: true
};

var areaColumn = {
  title: 'Area',
  defaultContent: 'unknown',
  data: 'area',
  searching: true
};

var discriptionColumn = {
  title: 'Discription',
  defaultContent: 'unknown',
  data: 'discription',
  searching: true
};
// slotGroup columns end


$(function () {
  var slotGroupColumns = [Table.selectColumn, detailsColum, nameColumn, areaColumn, discriptionColumn];

  $('#slot-groups-table').DataTable({
    ajax: {
      url: '/slotGroups/json',
      dataSrc: ''
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
    columns: slotGroupColumns,
    order: [
      [2, 'asc']
    ]
  });
  Table.addFilterFoot('#slot-group-table', slotGroupColumns);
  Table.filterEvent();
  Table.selectEvent();
});
