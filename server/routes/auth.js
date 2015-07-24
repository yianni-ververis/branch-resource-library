var express = require('express'),
    router = express.Router(),
    Error = require('../controllers/error'),
    passport = require('passport');

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user){
    if(err){
      res.json(Error.custom(err));
    }
    else{
      req.logIn(user, function(err){
        if(err){
          res.json(Error.custom(err));
        }
        else{
          res.json({});
        }
      })
    }
  })(req, res, next);
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/signup', function(req, res){
  passport.authenticate('signup', function(err, user){
    if(err){
      res.json(Error.custom(err));
    }
    else{
      res.json(user);
    }
  })(req, res);
});

//we probaby want to redesign this
router.get('/menu', function(req, res){
  var topMenu;
  var basicMenu = {
    items: [{
      label: "Create Project",
      href: ""
    },
    {
      label: "Logout",
      href: "#logout"
    }]
  };
  if(req.user){
    topMenu = {
      items:[{
        label: req.user.username,
        href:"#",
        items: basicMenu
      }]
    };
    basicMenu = basicMenu.items.splice(0,0, {
      label: "Profile",
      href: "#users/" + req.user._id
    });
  }
  else{
    topMenu = {
      items:[{
        label: "Login/Signup",
        href: "#loginsignup",
        items: []
      }]
    };
  }
  if(req.user && req.user.role=="admin"){
    basicMenu = basicMenu.items.splice(0,0, {
      label: "Admin Console",
      href: "#admin"
    });
  }
  topMenu.items[0].items = basicMenu;
  console.log(topMenu);
  res.json(topMenu);
});

module.exports = router;
