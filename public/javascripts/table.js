
var Table = (function (parent) {
  // general function starts
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
    $('.filter').on('keyup', 'input', function () {
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
// filter function end



  parent.addFilterFoot = addFilterFoot;
  parent.selectEvent = selectEvent;
  parent.filterEvent = filterEvent;
  parent.personColumn = personColumn;
  parent.progressBar = progressBar;

  return parent;

}(Table || {}));