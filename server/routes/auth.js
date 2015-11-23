var express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Error = require('../controllers/error'),
    passport = require('passport');

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user){
    if(err){
      console.log('here');
      res.json(Error.custom(err));
    }
    else{
      req.logIn(user, function(err){
        if(err){
          res.json(Error.custom(err));
        }
        else{
          console.log('here we are');
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
      req.logIn(user, function(err){
        if(err){
          res.json(Error.custom(err));
        }
        else{
          res.json({});
        }
      })
    }
  })(req, res);
});

router.post('/reset', function(req, res){
  require('../controllers/passport/reset.js')(req, res, function(err, user) {
    if(err){
      res.json(Error.custom(err));
    }
    else{
      res.json({});
    }
  })
});

router.post('/change', function(req, res){
  if(req.user){
    User.findOne({'_id': req.user._id}, function(err, user){
      if(user.authenticate(req.body.oldPassword)){
        user.salt = user.createSalt(req.body.password);
        user.password = user.hashPassword(req.body.password, user.salt);
        user.save(function(err){
          if(err){
            res.json(Error.custom(err));
          }
          else{
            res.json({});
          }
        });
      }
      else{
        res.json(Error.custom("Old Password is not correct"));
      }
    });
  }
});

module.exports = router;
