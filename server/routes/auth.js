var express = require('express'),
    router = express.Router(),
    Error = require('../controllers/error'),
    passport = require('passport');

router.post('/login', passport.authenticate('local',{successRedirect: '/', failureRedirect: ''}));

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

module.exports = router;
