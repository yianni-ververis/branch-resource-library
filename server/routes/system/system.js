var express = require('express'),
    router = express.Router(),
    Error = require('../../controllers/error'),
    MasterController = require('../../controllers/master'),
    git = require("github"),
    GitHub = new git({
        // required
        version: "3.0.0",
        // optional
        debug: false,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        pathPrefix: "", // for some GHEs; none for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
        }
    });

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

router.post('/git/projects', function(req, res){
  try{
    GitHub.authenticate({type: "basic", username: req.body.user, password: req.body.password});
    GitHub.repos.getAll({user:req.body.user}, function(err, repos){
      if(err){
        console.log(err);
        res.json(Error.custom("Could not Git Projects"));
      }
      else{
        res.json({repos: repos});
      }
    });
  }
  catch(ex){
    res.json(Error.custom("Unable to authenticate"));
  }
});

function buildMenu(user){
  var topMenu;
  var basicMenu = [
    {
      label: "Logout",
      href: "/auth/logout"
    }
  ];
  if(user){
    basicMenu.splice(0,0,{
      label: "Change Password",
      href: "#user/changepassword"
    });
    basicMenu.splice(0,0, {
      label: "My Profile",
      href: "#user/" + user._id
    });
    if(user.role.permissions && user.role.permissions.discussion && user.role.permissions.discussion.create==true){
      basicMenu.splice(0,0,{
        label: "Create Discussion",
        href: "#discussion/new/edit"
      });
    }
    if(user.role.permissions && user.role.permissions.blog && user.role.permissions.blog.create==true){
      basicMenu.splice(0,0,{
        label: "Create Blog",
        href: "#blog/new/edit"
      });
    }
    if(user.role.permissions && user.role.permissions.project && user.role.permissions.project.create==true){
      basicMenu.splice(0,0,{
        label: "Create Project",
        href: "#project/new/edit"
      });
    }
    topMenu = {
      items:[{
        label: user.username,
        href:"#",
        items: []
      }]
    };
    //establish whether or not the user has "moderator" permissions
    if(user.role.permissions){
      var strPerm = JSON.stringify(user.role.permissions);
      console.log(strPerm);
      if(strPerm.indexOf('"hide":true')!=-1 || strPerm.indexOf('"approve":true')!=-1 || strPerm.indexOf('"flag":true')!=-1){
        basicMenu.splice(0,0, {
          label: "Moderator Console",
          href: "#moderator"
        });
      }
    }
    //establish whether or not the user is an admin
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
        href: "#loginsignup",
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
