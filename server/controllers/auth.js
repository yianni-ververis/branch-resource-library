var User            = require("../models/user");
var UserProfile     = require("../models/userprofile");
var atob            = require("atob");
var entities        = require("../routes/entityConfig");

module.exports = {
  isLoggedIn: function(req, res, next){
    if(!req.headers.authorization && req.method=="GET" && (entities[req.params.entity].requiresAuthentication!=undefined && entities[req.params.entity].requiresAuthentication==false)){
      next();
    }
    else if(req.isAuthenticated()){
      next();
    }
    else if(req.headers.authorization){
      //we only accept GET requests outside of the client at present
      if (req.method!="GET"){
        res.json({errorCode: 6, errorText: req.method + " requests are currently not allowed."});
      }
      else{
        var ascii = req.headers.authorization.split(" ").pop();
        if(ascii.split(":").length==2){
          credentials = ascii.split(":");
        }
        else {
          credentials = atob(ascii).split(":");
        }
        var username = credentials[0], password = credentials[1];
        UserProfile.findOne({username: username}).populate("role").exec(function(err, userProfile){
          if(userProfile){
            User.findOne({"_id": userProfile._id}, function(err, user){
              if(user){
                if(user.authenticate(password)==true){
                  req.user = userProfile;
                  next();
                }
                else {
                  res.json({errorCode: 401, errorText: "User not logged in", redirect: "#!login"});
                }
              }
              else{
              }
            });
          }
          else{
            res.json({errorCode: 401, errorText: "User does not exist", redirect: "#!login"});
          }
        });
      }
    }
    else if(req.headers.username && req.headers.password){
      //we only accept GET requests outside of the client at present
      if (req.method!="GET"){
        res.json({errorCode: 6, errorText: req.method + " requests are currently not allowed."});
      }
      else{
        UserProfile.findOne({username: req.headers.username}).populate("role").exec(function(err, userProfile){
          if(userProfile){
            User.findOne({"_id": userProfile._id}, function(err, user){
              if(user){
                if(user.authenticate(req.headers.password)==true){
                  req.user = userProfile;
                  next();
                }
                else {
                  res.json({errorCode: 401, errorText: "User not logged in", redirect: "#!login"})
                }
              }
            });
          }
          else{
            res.json({errorCode: 401, errorText: "User does not exist", redirect: "#!login"})
          }
        });
      }
    }
    else{
      res.json({errorCode: 401, errorText: "User not logged in", redirect: "#!login"})
    }
  }
}
