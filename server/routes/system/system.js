var express = require('express'),
    router = express.Router(),
    Error = require('../../controllers/error'),
    MasterController = require('../../controllers/master');

router.get('/userInfo', function(req, res){
  var menu = buildMenu(req.user);
  var userNoPassword = {};
  console.log(menu);
  if(req.user&&req.user.role){
    userNoPassword = cloneObject(req.user);
    delete userNoPassword["password"];
  }
  res.json({
    user: userNoPassword,
    menu: menu
  });
});

function buildMenu(user){
  var topMenu;
  var basicMenu = [
    {
      label: "Create Project",
      href: "#projects/new"
    },
    {
      label: "Logout",
      href: "/auth/logout"
    }
  ];
  if(user){
    basicMenu.splice(0,0, {
      label: "Profile",
      href: "#users/" + user._id
    });
    topMenu = {
      items:[{
        label: user.username,
        href:"#",
        items: []
      }]
    };
    if(user.role.name=="admin"){
      basicMenu.splice(0,0, {
        label: "Admin Console",
        href: "#admin"
      });
    }
    topMenu.items[0].items = basicMenu;
  }
  else{
    topMenu = {
      items:[{
        label: "Login",
        href: "#login",
        items: []
      }]
    };
  }
  return topMenu;
}

function cloneObject(object){
  var clone = {};
  for (var key in object){
    clone[key] = object[key];
  }
  return clone;
}

module.exports = router;
