var entities = require("../routes/entityConfig");

module.exports = {
  isLoggedIn: function(req, res, next){
    console.log('checking auth');
    //some entities do NOT require authentication for GET requests
    //this does NOT apply to calls made outside of the Website UI (i.e. from a REST client)
    console.log(req.method=="GET");
    if(req.method=="GET" && !hasHeaderAuthentication(req)){
      next();
    }
    else if(req.isAuthenticated() || hasHeaderAuthentication(req)){
      if(req.user.role.name=="user"){
        res.json({errorCode:401, errorText:'Insufficient Permissions'});
      }
      else{
        next();
      }
    }
    else{
      res.json({errorCode: 401, errorText: 'User not logged in', redirect: '#login'})
    }
  }
}


function hasHeaderAuthentication(req){
  //need to implement a login check here that validates user and password headers
  return false;
}
