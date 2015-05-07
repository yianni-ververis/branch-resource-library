//need to check session cookie to see if user is logged in
renderHeader(false);

$('#header').on('click', '.btn-login', function(event){
  event.preventDefault();
  var data = $('#loginForm')[0].elements;
  $.post('/login', {
    email: data['email'].value,
    password: data['password'].value
  })
  .success(function(data){
    renderHeader(true);
  })
  .fail(function(data){
    console.log('no');
  });
});

function renderHeader(loggedIn){
  //get and compile the header html
  $.get('../views/header.html').success(function(html){
    $('#header').html(Handlebars.compile(html)({loggedIn:loggedIn}));
  });
}
