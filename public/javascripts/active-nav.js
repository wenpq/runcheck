$(function () {
  var paths = location.pathname.split('/');
  if (paths.length > 2 ) {
    $('header .navbar-nav li').has('a[href="' + '/'+paths[1]+'/' + '"]').addClass('active');
  }
});
