var User     = require("../models/user");
var atob     = require("atob");
var entities = require("../routes/entityConfig");

module.exports = {
  isLoggedIn: function(req, res, next){    
    if(req.method=="GET" && (entities[req.params.entity].requiresAuthentication!=undefined && entities[req.params.entity].requiresAuthentication==false)){
      next();
    }
    else if(req.isAuthenticated()){
      next();
    }
    else if(req.headers.authorization){
      var ascii = req.headers.authorization.split(" ").pop();
      var credentials = atob(ascii).split(":");
      var username = credentials[0], password = credentials[1];
      User.findOne({email: username}).populate("role partner").exec(function(err, user){
        if(user.authenticate(password)==true){
          req.user = user;
          next();
        }
        else {
          console.log(req.url);
          res.json({errorCode: 401, errorText: "User not logged in", redirect: "#login?url="+req.url})
        }
      });
    }
    else if(req.headers.username && req.headers.password){
      User.findOne({email: req.headers.username}).populate("role partner").exec(function(err, user){
        if(user.authenticate(req.headers.password)==true){
          req.user = user;
          next();
        }
        else {
          res.json({errorCode: 401, errorText: "User not logged in", redirect: "#login?url="+req.url})
        }
      });
    }
    else{
      res.json({errorCode: 401, errorText: "User not logged in", redirect: "#login?url="+req.url})
    }
  }
}
