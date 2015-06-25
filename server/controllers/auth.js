module.exports = {
  isLoggedIn: function(req, res, next){
    console.log('checking auth');
    if(req.isAuthenticated() || hasHeaderAuthentication(req)){
      if(req.user.role.name=="user"){
        res.json({errorCode:401, errorText:'Insufficient Permissions'});
      }
      else{
        next();
      }
    }
    else{
      res.json([{errorCode: 401, errorText: 'User not logged in', redirect: '#login'}])
    }
  }
}


function hasHeaderAuthentication(req){
  //need to implement a login check here that validates user and password headers
  return false;
}
