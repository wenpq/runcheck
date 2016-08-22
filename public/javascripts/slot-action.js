$('#list-slot').click(function () {
  if($(this).attr('title') === 'hide details') {
    $('#slot-detail').hide();
    $(this).removeClass(' fa-chevron-up');
    $(this).addClass(' fa-chevron-down');
    $(this).attr('title', 'show more details');
  }else {
    $('#slot-detail').show();
    $(this).removeClass('fa-chevron-down');
    $(this).addClass('fa-chevron-up');
    $(this).attr('title', 'hide details');
  }
});


$(function () {
  $('#slot-detail').hide();
});
